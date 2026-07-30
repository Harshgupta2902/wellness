"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession, type ActionResult } from "@/actions/auth";
import { decrypt } from "@/lib/encryption";

interface OrgStats {
  totalAssessments: number;
  avgWellness: number;
  highRiskCount: number;
  assessments: {
    id: string;
    employeeName: string;
    department: string;
    overallScore: number;
    riskLevel: string;
    submittedAt: string;
  }[];
  categoryAverages: { category: string; average: number }[];
  riskDistribution: { level: string; count: number }[];
}

export async function getOrgDashboardData(): Promise<ActionResult<OrgStats>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "org_admin" && session.role !== "super_admin") {
    return { success: false, message: "Unauthorized", data: null };
  }

  const supabase = createServerClient();

  // Get organization ID
  let orgId: string | null = session.organizationId;

  // Super admin sees all if no specific org
  // For now, get all assessments for the org or all
  let assessmentQuery = supabase
    .from("assessments")
    .select(`
      id, overall_score, risk_level, submitted_at,
      employee_id, organization_id, version_id
    `)
    .is("deleted_at", null)
    .order("submitted_at", { ascending: false });

  if (orgId && session.role === "org_admin") {
    assessmentQuery = assessmentQuery.eq("organization_id", orgId);
  }

  const { data: assessments, error } = await assessmentQuery;

  if (error) return { success: false, message: error.message, data: null };
  if (!assessments || assessments.length === 0) {
    return {
      success: true,
      message: "No assessments yet",
      data: {
        totalAssessments: 0,
        avgWellness: 0,
        highRiskCount: 0,
        assessments: [],
        categoryAverages: [],
        riskDistribution: [],
      },
    };
  }

  // Get employee details
  const employeeIds = [...new Set(assessments.map((a) => a.employee_id))];
  const { data: employees } = await supabase
    .from("employees")
    .select("id, encrypted_name, encrypted_department")
    .in("id", employeeIds);

  const employeeMap = new Map(
    (employees || []).map((e) => [
      e.id,
      {
        name: decrypt(e.encrypted_name),
        department: decrypt(e.encrypted_department),
      },
    ])
  );

  // Build assessment list with decrypted employee info
  const assessmentList = assessments.map((a) => {
    const emp = employeeMap.get(a.employee_id) || { name: "Unknown", department: "Unknown" };
    return {
      id: a.id,
      employeeName: emp.name,
      department: emp.department,
      overallScore: Number(a.overall_score) || 0,
      riskLevel: a.risk_level || "moderate",
      submittedAt: a.submitted_at,
    };
  });

  // Calculate stats
  const totalAssessments = assessments.length;
  const avgWellness = Math.round(
    assessments.reduce((sum, a) => sum + (Number(a.overall_score) || 0), 0) / totalAssessments
  );
  const highRiskCount = assessments.filter(
    (a) => a.risk_level === "high_risk" || a.risk_level === "critical"
  ).length;

  // Risk distribution
  const riskCounts: Record<string, number> = {};
  for (const a of assessments) {
    const level = a.risk_level || "moderate";
    riskCounts[level] = (riskCounts[level] || 0) + 1;
  }
  const riskDistribution = Object.entries(riskCounts).map(([level, count]) => ({ level, count }));

  // Category averages (from assessment_answers)
  // Get the latest version's categories
  const versionIds = [...new Set(assessments.map((a) => a.version_id))];
  let categoryAverages: { category: string; average: number }[] = [];

  if (versionIds.length > 0) {
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, weight")
      .in("version_id", versionIds)
      .is("deleted_at", null);

    if (categories && categories.length > 0) {
      const { data: allAnswers } = await supabase
        .from("assessment_answers")
        .select("assessment_id, question_id, calculated_score")
        .in("assessment_id", assessments.map((a) => a.id));

      const { data: allQuestions } = await supabase
        .from("questions")
        .select("id, category_id, weight")
        .in("version_id", versionIds)
        .is("deleted_at", null);

      if (allAnswers && allQuestions) {
        const questionCategoryMap = new Map(allQuestions.map((q) => [q.id, q.category_id]));

        // Sum scores per category
        const catScores: Record<string, { total: number; count: number }> = {};
        for (const cat of categories) {
          catScores[cat.id] = { total: 0, count: 0 };
        }

        for (const ans of allAnswers) {
          if (ans.calculated_score != null) {
            const catId = questionCategoryMap.get(ans.question_id);
            if (catId && catScores[catId]) {
              catScores[catId].total += Number(ans.calculated_score);
              catScores[catId].count += 1;
            }
          }
        }

        const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));
        categoryAverages = Object.entries(catScores)
          .filter(([, v]) => v.count > 0)
          .map(([catId, v]) => ({
            category: categoryNameMap.get(catId) || "Unknown",
            average: Math.round((v.total / v.count / 5) * 100), // normalize to percentage (max score per q is 5)
          }));
      }
    }
  }

  return {
    success: true,
    message: "Success",
    data: {
      totalAssessments,
      avgWellness,
      highRiskCount,
      assessments: assessmentList,
      categoryAverages,
      riskDistribution,
    },
  };
}
