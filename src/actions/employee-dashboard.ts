"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession, type ActionResult } from "@/actions/auth";

interface DashboardData {
  hasAssessment: boolean;
  overallScore: number;
  riskLevel: string;
  submittedAt: string;
  categoryScores: { category: string; percentage: number }[];
}

export async function getMyDashboardData(): Promise<ActionResult<DashboardData>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  const supabase = createServerClient();

  // Get employee record
  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", session.userId)
    .is("deleted_at", null)
    .single();

  if (!employee) {
    return { success: true, message: "No profile", data: { hasAssessment: false, overallScore: 0, riskLevel: "", submittedAt: "", categoryScores: [] } };
  }

  // Get latest assessment
  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, overall_score, risk_level, submitted_at, version_id")
    .eq("employee_id", employee.id)
    .is("deleted_at", null)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  if (!assessment) {
    return { success: true, message: "No assessment", data: { hasAssessment: false, overallScore: 0, riskLevel: "", submittedAt: "", categoryScores: [] } };
  }

  // Get categories for this version
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, weight")
    .eq("version_id", assessment.version_id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // Get answers for this assessment
  const { data: answers } = await supabase
    .from("assessment_answers")
    .select("question_id, calculated_score")
    .eq("assessment_id", assessment.id);

  // Get questions to map to categories
  const { data: questions } = await supabase
    .from("questions")
    .select("id, category_id, weight")
    .eq("version_id", assessment.version_id)
    .is("deleted_at", null);

  // Calculate category percentages
  const categoryScores: { category: string; percentage: number }[] = [];

  if (categories && answers && questions) {
    const questionCatMap = new Map(questions.map((q) => [q.id, { categoryId: q.category_id, weight: Number(q.weight) }]));

    for (const cat of categories) {
      let total = 0;
      let maxPossible = 0;

      for (const ans of answers) {
        const qInfo = questionCatMap.get(ans.question_id);
        if (qInfo && qInfo.categoryId === cat.id && ans.calculated_score != null) {
          total += Number(ans.calculated_score);
          maxPossible += 5 * qInfo.weight; // max is 5 per question * weight
        }
      }

      const percentage = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
      categoryScores.push({ category: cat.name, percentage });
    }
  }

  return {
    success: true,
    message: "Success",
    data: {
      hasAssessment: true,
      overallScore: Number(assessment.overall_score) || 0,
      riskLevel: assessment.risk_level || "moderate",
      submittedAt: assessment.submitted_at,
      categoryScores,
    },
  };
}
