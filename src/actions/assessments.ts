"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession, type ActionResult } from "@/actions/auth";
import { logAudit } from "@/lib/audit";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveAssessment {
  versionId: string;
  versionNumber: number;
  templateName: string;
  templateDescription: string | null;
  categories: {
    id: string;
    name: string;
    weight: number;
    sort_order: number;
  }[];
  questions: {
    id: string;
    category_id: string;
    question_text: string;
    question_type: string;
    weight: number;
    is_required: boolean;
    is_reverse_scored: boolean;
    sort_order: number;
    condition_question_id: string | null;
    condition_operator: string | null;
    condition_value: string | null;
    question_options: { id: string; label: string; value: number; sort_order: number }[];
  }[];
  personalFields: {
    id: string;
    field_name: string;
    field_label: string;
    field_type: string;
    is_required: boolean;
    options: Record<string, unknown> | null;
    sort_order: number;
  }[];
}

interface SubmitInput {
  versionId: string;
  answers: { questionId: string; value?: number; text?: string }[];
}

interface SubmitResult {
  assessmentId: string;
  overallScore: number;
  riskLevel: string;
  categoryScores: { category: string; percentage: number }[];
}

interface MyAssessment {
  id: string;
  overall_score: number | null;
  risk_level: string | null;
  submitted_at: string;
}

// ─── Get Active (Published) Assessment ────────────────────────────────────────

export async function getActiveAssessment(): Promise<ActionResult<ActiveAssessment>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  const supabase = createServerClient();

  // Latest published version
  const { data: version } = await supabase
    .from("assessment_versions")
    .select("id, version_number, template_id, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (!version) {
    return { success: false, message: "No published assessment available", data: null };
  }

  // Template info
  const { data: template } = await supabase
    .from("assessment_templates")
    .select("name, description")
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
      id, category_id, question_text, question_type, weight,
      is_required, is_reverse_scored, sort_order,
      condition_question_id, condition_operator, condition_value,
      question_options (id, label, value, sort_order)
    `)
    .eq("version_id", version.id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // Personal fields
  const { data: personalFields } = await supabase
    .from("personal_info_fields")
    .select("id, field_name, field_label, field_type, is_required, options, sort_order")
    .eq("version_id", version.id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return {
    success: true,
    message: "Success",
    data: {
      versionId: version.id,
      versionNumber: version.version_number,
      templateName: template?.name || "Assessment",
      templateDescription: template?.description || null,
      categories: (categories || []).map((c) => ({ ...c, weight: Number(c.weight) })),
      questions: (questions || []).map((q) => ({
        ...q,
        weight: Number(q.weight),
        question_options: (q.question_options || []).sort(
          (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
        ),
      })),
      personalFields: personalFields || [],
    },
  };
}

// ─── Submit Assessment ────────────────────────────────────────────────────────

export async function submitAssessment(input: SubmitInput): Promise<ActionResult<SubmitResult>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "employee") return { success: false, message: "Only employees can submit", data: null };

  const { versionId, answers } = input;
  if (!versionId || !answers?.length) {
    return { success: false, message: "versionId and answers are required", data: null };
  }

  const supabase = createServerClient();

  // Get employee
  const { data: employee } = await supabase
    .from("employees")
    .select("id, organization_id")
    .eq("user_id", session.userId)
    .is("deleted_at", null)
    .single();

  if (!employee) return { success: false, message: "Employee profile not found", data: null };

  // Check 15-day retake rule
  const { data: lastAssessment } = await supabase
    .from("assessments")
    .select("submitted_at")
    .eq("employee_id", employee.id)
    .eq("version_id", versionId)
    .is("deleted_at", null)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  if (lastAssessment) {
    const daysSince = (Date.now() - new Date(lastAssessment.submitted_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 15) {
      return { success: false, message: `Cannot retake. ${Math.ceil(15 - daysSince)} days remaining.`, data: null };
    }
  }

  // Verify published
  const { data: version } = await supabase
    .from("assessment_versions")
    .select("status")
    .eq("id", versionId)
    .single();

  if (!version || version.status !== "published") {
    return { success: false, message: "Assessment not available", data: null };
  }

  // Load questions & categories for scoring
  const { data: questions } = await supabase
    .from("questions")
    .select("id, category_id, weight, is_reverse_scored")
    .eq("version_id", versionId)
    .is("deleted_at", null);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, weight")
    .eq("version_id", versionId)
    .is("deleted_at", null);

  if (!questions || !categories) {
    return { success: false, message: "Failed to load assessment structure", data: null };
  }

  // Score calculation
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const categoryScores: Record<string, { total: number; maxPossible: number; weight: number }> = {};

  for (const cat of categories) {
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
      employee_id: employee.id,
      organization_id: employee.organization_id,
      version_id: versionId,
      overall_score: overallScore,
      risk_level: riskLevel,
    })
    .select()
    .single();

  if (assessErr) return { success: false, message: assessErr.message, data: null };

  // Insert answers
  if (answerRows.length > 0) {
    const { error: ansErr } = await supabase
      .from("assessment_answers")
      .insert(answerRows.map((r) => ({ assessment_id: assessment.id, ...r })));

    if (ansErr) return { success: false, message: ansErr.message, data: null };
  }

  const categoryBreakdown = categories.map((cat) => {
    const cs = categoryScores[cat.id];
    const pct = cs.maxPossible > 0 ? Math.round((cs.total / cs.maxPossible) * 100) : 0;
    return { category: cat.name, percentage: pct };
  });

  await logAudit({
    userId: session.userId,
    action: "assessment_submitted",
    entityType: "assessment",
    entityId: assessment.id,
    metadata: { overallScore, riskLevel },
  });

  return {
    success: true,
    message: "Assessment submitted",
    data: {
      assessmentId: assessment.id,
      overallScore,
      riskLevel,
      categoryScores: categoryBreakdown,
    },
  };
}

// ─── Get My Assessments ───────────────────────────────────────────────────────

export async function getMyAssessments(): Promise<ActionResult<MyAssessment[]>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  const supabase = createServerClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", session.userId)
    .is("deleted_at", null)
    .single();

  if (!employee) return { success: false, message: "Employee not found", data: null };

  const { data, error } = await supabase
    .from("assessments")
    .select("id, overall_score, risk_level, submitted_at")
    .eq("employee_id", employee.id)
    .is("deleted_at", null)
    .order("submitted_at", { ascending: false });

  if (error) return { success: false, message: error.message, data: null };
  return { success: true, message: "Success", data: data as MyAssessment[] };
}
