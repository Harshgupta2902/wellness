"use server";

import { createServerClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";
import { logAudit } from "@/lib/audit";
import type { ActionResult } from "@/actions/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalInfo {
  name: string;
  email: string;
  age?: string;
  department: string;
  designation?: string;
  phone?: string;
  workMode?: string;
  organizationId: string;
}

interface PublicSubmitInput {
  versionId: string;
  personalInfo: PersonalInfo;
  answers: { questionId: string; value?: number; text?: string }[];
}

interface PublicSubmitResult {
  assessmentId: string;
  overallScore: number;
  riskLevel: string;
  categoryScores: { category: string; percentage: number }[];
  isNewUser: boolean;
}

// ─── Get Active Assessment (Public - no auth needed) ──────────────────────────

export async function getPublicActiveAssessment(): Promise<ActionResult<{
  versionId: string;
  templateName: string;
  categories: { id: string; name: string; weight: number; sort_order: number }[];
  questions: {
    id: string;
    category_id: string;
    question_text: string;
    question_type: string;
    is_required: boolean;
    is_reverse_scored: boolean;
    sort_order: number;
    question_options: { id: string; label: string; value: number; sort_order: number }[];
  }[];
  organizations: { id: string; name: string }[];
}>> {
  const supabase = createServerClient();

  // Get latest published version
  const { data: version } = await supabase
    .from("assessment_versions")
    .select("id, version_number, template_id")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (!version) {
    return { success: false, message: "No published assessment available", data: null };
  }

  // Template name
  const { data: template } = await supabase
    .from("assessment_templates")
    .select("name")
    .eq("id", version.template_id)
    .single();

  // Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, weight, sort_order")
    .eq("version_id", version.id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // Questions with options
  const { data: questions } = await supabase
    .from("questions")
    .select(`
      id, category_id, question_text, question_type,
      is_required, is_reverse_scored, sort_order,
      question_options (id, label, value, sort_order)
    `)
    .eq("version_id", version.id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // Organizations (for the dropdown)
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return {
    success: true,
    message: "Success",
    data: {
      versionId: version.id,
      templateName: template?.name || "Wellness Assessment",
      categories: (categories || []).map((c) => ({ ...c, weight: Number(c.weight) })),
      questions: (questions || []).map((q) => ({
        ...q,
        question_options: (q.question_options || []).sort(
          (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
        ),
      })),
      organizations: organizations || [],
    },
  };
}

// ─── Submit Assessment (Public - auto creates user/employee) ──────────────────

export async function submitPublicAssessment(input: PublicSubmitInput): Promise<ActionResult<PublicSubmitResult>> {
  const { versionId, personalInfo, answers } = input;

  if (!versionId || !answers?.length) {
    return { success: false, message: "Assessment data is required", data: null };
  }

  if (!personalInfo.email || !personalInfo.name || !personalInfo.organizationId) {
    return { success: false, message: "Name, email, and organization are required", data: null };
  }

  const supabase = createServerClient();
  const email = personalInfo.email.toLowerCase().trim();

  // Verify version is published
  const { data: version } = await supabase
    .from("assessment_versions")
    .select("status")
    .eq("id", versionId)
    .single();

  if (!version || version.status !== "published") {
    return { success: false, message: "Assessment not available", data: null };
  }

  // Find or create user
  let userId: string;
  let employeeId: string;
  let isNewUser = false;

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    userId = existingUser.id;

    // Get employee record
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", userId)
      .eq("organization_id", personalInfo.organizationId)
      .is("deleted_at", null)
      .single();

    if (existingEmployee) {
      employeeId = existingEmployee.id;
    } else {
      // Create employee profile for this org
      const { data: newEmp, error: empErr } = await supabase
        .from("employees")
        .insert({
          user_id: userId,
          organization_id: personalInfo.organizationId,
          encrypted_name: encrypt(personalInfo.name),
          encrypted_department: encrypt(personalInfo.department),
          encrypted_designation: personalInfo.designation ? encrypt(personalInfo.designation) : null,
          encrypted_phone: personalInfo.phone ? encrypt(personalInfo.phone) : null,
          encrypted_age: personalInfo.age ? encrypt(personalInfo.age) : null,
          status: "active",
        })
        .select("id")
        .single();

      if (empErr) return { success: false, message: "Failed to create profile: " + empErr.message, data: null };
      employeeId = newEmp.id;
    }
  } else {
    // Create new user with master password
    const passwordHash = hashPassword("Wellness@12345");

    const { data: newUser, error: userErr } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        role: "employee",
        organization_id: personalInfo.organizationId,
        is_active: true,
      })
      .select("id")
      .single();

    if (userErr) return { success: false, message: "Failed to create account: " + userErr.message, data: null };
    userId = newUser.id;
    isNewUser = true;

    // Create employee profile
    const { data: newEmp, error: empErr } = await supabase
      .from("employees")
      .insert({
        user_id: userId,
        organization_id: personalInfo.organizationId,
        encrypted_name: encrypt(personalInfo.name),
        encrypted_department: encrypt(personalInfo.department),
        encrypted_designation: personalInfo.designation ? encrypt(personalInfo.designation) : null,
        encrypted_phone: personalInfo.phone ? encrypt(personalInfo.phone) : null,
        encrypted_age: personalInfo.age ? encrypt(personalInfo.age) : null,
        status: "active",
      })
      .select("id")
      .single();

    if (empErr) return { success: false, message: "Failed to create profile: " + empErr.message, data: null };
    employeeId = newEmp.id;
  }

  // Check 15-day retake rule
  const { data: lastAssessment } = await supabase
    .from("assessments")
    .select("submitted_at")
    .eq("employee_id", employeeId)
    .eq("version_id", versionId)
    .is("deleted_at", null)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  if (lastAssessment) {
    const daysSince = (Date.now() - new Date(lastAssessment.submitted_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 15) {
      return { success: false, message: `Cannot retake yet. ${Math.ceil(15 - daysSince)} days remaining.`, data: null };
    }
  }

  // Load questions & categories for scoring
  const { data: dbQuestions } = await supabase
    .from("questions")
    .select("id, category_id, weight, is_reverse_scored")
    .eq("version_id", versionId)
    .is("deleted_at", null);

  const { data: dbCategories } = await supabase
    .from("categories")
    .select("id, name, weight")
    .eq("version_id", versionId)
    .is("deleted_at", null);

  if (!dbQuestions || !dbCategories) {
    return { success: false, message: "Failed to load assessment structure", data: null };
  }

  // Score calculation
  const questionMap = new Map(dbQuestions.map((q) => [q.id, q]));
  const categoryScores: Record<string, { total: number; maxPossible: number; weight: number }> = {};

  for (const cat of dbCategories) {
    categoryScores[cat.id] = { total: 0, maxPossible: 0, weight: Number(cat.weight) };
  }

  const answerRows: {
    question_id: string;
    answer_value: number | null;
    answer_text: string | null;
    calculated_score: number | null;
  }[] = [];

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    let calculatedScore: number | null = null;

    if (answer.value != null) {
      const maxValue = 5;
      let score = answer.value;
      if (question.is_reverse_scored) score = maxValue + 1 - score;

      const qWeight = Number(question.weight);
      calculatedScore = score * qWeight;

      if (categoryScores[question.category_id]) {
        categoryScores[question.category_id].total += score * qWeight;
        categoryScores[question.category_id].maxPossible += maxValue * qWeight;
      }
    }

    answerRows.push({
      question_id: answer.questionId,
      answer_value: answer.value ?? null,
      answer_text: answer.text ?? null,
      calculated_score: calculatedScore,
    });
  }

  // Weighted overall
  let overallScore = 0;
  let totalWeight = 0;
  for (const cs of Object.values(categoryScores)) {
    if (cs.maxPossible > 0) {
      overallScore += (cs.total / cs.maxPossible) * 100 * cs.weight;
      totalWeight += cs.weight;
    }
  }
  overallScore = totalWeight > 0 ? Math.round(overallScore / totalWeight) : 0;

  // Risk level
  let riskLevel: string;
  if (overallScore >= 90) riskLevel = "excellent";
  else if (overallScore >= 80) riskLevel = "healthy";
  else if (overallScore >= 65) riskLevel = "moderate";
  else if (overallScore >= 50) riskLevel = "high_risk";
  else riskLevel = "critical";

  // Insert assessment
  const { data: assessment, error: assessErr } = await supabase
    .from("assessments")
    .insert({
      employee_id: employeeId,
      organization_id: personalInfo.organizationId,
      version_id: versionId,
      overall_score: overallScore,
      risk_level: riskLevel,
    })
    .select()
    .single();

  if (assessErr) return { success: false, message: assessErr.message, data: null };

  // Insert answers
  if (answerRows.length > 0) {
    await supabase
      .from("assessment_answers")
      .insert(answerRows.map((r) => ({ assessment_id: assessment.id, ...r })));
  }

  const categoryBreakdown = dbCategories.map((cat) => {
    const cs = categoryScores[cat.id];
    const pct = cs.maxPossible > 0 ? Math.round((cs.total / cs.maxPossible) * 100) : 0;
    return { category: cat.name, percentage: pct };
  });

  await logAudit({
    userId,
    action: "assessment_submitted",
    entityType: "assessment",
    entityId: assessment.id,
    metadata: { overallScore, riskLevel, email, isNewUser },
  });

  return {
    success: true,
    message: "Assessment submitted",
    data: {
      assessmentId: assessment.id,
      overallScore,
      riskLevel,
      categoryScores: categoryBreakdown,
      isNewUser,
    },
  };
}
