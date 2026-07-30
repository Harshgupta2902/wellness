"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession, type ActionResult } from "@/actions/auth";
import { logAudit } from "@/lib/audit";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateWithVersions {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  versions: {
    id: string;
    version_number: number;
    status: string;
    published_at: string | null;
  }[];
}

interface CreateQuestionInput {
  categoryId: string;
  questionText: string;
  questionType?: string;
  weight?: number;
  isRequired?: boolean;
  isReverseScored?: boolean;
  sortOrder?: number;
  conditionQuestionId?: string;
  conditionOperator?: string;
  conditionValue?: string;
  options?: { label: string; value: number }[];
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<ActionResult<TemplateWithVersions[]>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("assessment_templates")
    .select(`
      id, name, description, created_at,
      assessment_versions (id, version_number, status, published_at)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { success: false, message: error.message, data: null };

  const templates = (data || []).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    created_at: t.created_at,
    versions: t.assessment_versions || [],
  }));

  return { success: true, message: "Success", data: templates };
}

export async function createTemplate(name: string, description?: string): Promise<ActionResult<{ templateId: string; versionId: string }>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };
  if (!name?.trim()) return { success: false, message: "Name is required", data: null };

  const supabase = createServerClient();

  const { data: template, error: tErr } = await supabase
    .from("assessment_templates")
    .insert({ name: name.trim(), description: description?.trim() || null, created_by: session.userId })
    .select()
    .single();

  if (tErr) return { success: false, message: tErr.message, data: null };

  const { data: version, error: vErr } = await supabase
    .from("assessment_versions")
    .insert({ template_id: template.id, version_number: 1, status: "draft" })
    .select()
    .single();

  if (vErr) return { success: false, message: vErr.message, data: null };

  await logAudit({
    userId: session.userId,
    action: "assessment_created",
    entityType: "assessment_template",
    entityId: template.id,
    metadata: { name },
  });

  return { success: true, message: "Template created", data: { templateId: template.id, versionId: version.id } };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function createCategory(
  versionId: string,
  name: string,
  weight: number,
  sortOrder?: number
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  const supabase = createServerClient();

  // Verify draft
  const { data: version } = await supabase
    .from("assessment_versions")
    .select("status")
    .eq("id", versionId)
    .single();

  if (!version || version.status !== "draft") {
    return { success: false, message: "Cannot modify published version", data: null };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ version_id: versionId, name, weight, sort_order: sortOrder || 0 })
    .select()
    .single();

  if (error) return { success: false, message: error.message, data: null };

  await logAudit({
    userId: session.userId,
    action: "category_created",
    entityType: "category",
    entityId: data.id,
    metadata: { name, weight, versionId },
  });

  return { success: true, message: "Category created", data: { id: data.id } };
}

export async function getCategories(versionId: string): Promise<ActionResult<{ id: string; name: string; weight: number; sort_order: number }[]>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, weight, sort_order")
    .eq("version_id", versionId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) return { success: false, message: error.message, data: null };
  return { success: true, message: "Success", data: (data || []).map((c) => ({ ...c, weight: Number(c.weight) })) };
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function getQuestions(versionId: string): Promise<ActionResult<{
  id: string;
  category_id: string;
  question_text: string;
  question_type: string;
  weight: number;
  is_reverse_scored: boolean;
  sort_order: number;
}[]>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("questions")
    .select("id, category_id, question_text, question_type, weight, is_reverse_scored, sort_order")
    .eq("version_id", versionId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) return { success: false, message: error.message, data: null };
  return { success: true, message: "Success", data: (data || []).map((q) => ({ ...q, weight: Number(q.weight) })) };
}

export async function createQuestion(versionId: string, input: CreateQuestionInput): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  if (!input.categoryId || !input.questionText?.trim()) {
    return { success: false, message: "Category and question text are required", data: null };
  }

  const supabase = createServerClient();

  // Verify draft
  const { data: version } = await supabase
    .from("assessment_versions")
    .select("status")
    .eq("id", versionId)
    .single();

  if (!version || version.status !== "draft") {
    return { success: false, message: "Cannot modify published version", data: null };
  }

  const { data: question, error: qErr } = await supabase
    .from("questions")
    .insert({
      category_id: input.categoryId,
      version_id: versionId,
      question_text: input.questionText.trim(),
      question_type: input.questionType || "likert",
      weight: input.weight || 1,
      is_required: input.isRequired !== false,
      is_reverse_scored: input.isReverseScored || false,
      sort_order: input.sortOrder || 0,
      condition_question_id: input.conditionQuestionId || null,
      condition_operator: input.conditionOperator || null,
      condition_value: input.conditionValue || null,
    })
    .select()
    .single();

  if (qErr) return { success: false, message: qErr.message, data: null };

  // Insert options
  if (input.options?.length) {
    const optionRows = input.options.map((opt, idx) => ({
      question_id: question.id,
      label: opt.label,
      value: opt.value,
      sort_order: idx,
    }));
    await supabase.from("question_options").insert(optionRows);
  } else if (!input.questionType || input.questionType === "likert") {
    // Default likert options
    await supabase.from("question_options").insert([
      { question_id: question.id, label: "Strongly Disagree", value: 1, sort_order: 0 },
      { question_id: question.id, label: "Disagree", value: 2, sort_order: 1 },
      { question_id: question.id, label: "Neutral", value: 3, sort_order: 2 },
      { question_id: question.id, label: "Agree", value: 4, sort_order: 3 },
      { question_id: question.id, label: "Strongly Agree", value: 5, sort_order: 4 },
    ]);
  }

  await logAudit({
    userId: session.userId,
    action: "question_created",
    entityType: "question",
    entityId: question.id,
    metadata: { questionText: input.questionText, categoryId: input.categoryId },
  });

  return { success: true, message: "Question created", data: { id: question.id } };
}

// ─── Publish Version ──────────────────────────────────────────────────────────

export async function publishVersion(versionId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  const supabase = createServerClient();

  const { data: version } = await supabase
    .from("assessment_versions")
    .select("*")
    .eq("id", versionId)
    .single();

  if (!version) return { success: false, message: "Version not found", data: null };
  if (version.status === "published") return { success: false, message: "Already published", data: null };

  // Check has categories & questions
  const { data: cats } = await supabase
    .from("categories")
    .select("id")
    .eq("version_id", versionId)
    .is("deleted_at", null);

  if (!cats?.length) return { success: false, message: "No categories defined", data: null };

  const { data: qs } = await supabase
    .from("questions")
    .select("id")
    .eq("version_id", versionId)
    .is("deleted_at", null);

  if (!qs?.length) return { success: false, message: "No questions defined", data: null };

  const { error } = await supabase
    .from("assessment_versions")
    .update({ status: "published", published_at: new Date().toISOString(), published_by: session.userId })
    .eq("id", versionId);

  if (error) return { success: false, message: error.message, data: null };

  await logAudit({
    userId: session.userId,
    action: "assessment_published",
    entityType: "assessment_version",
    entityId: versionId,
  });

  return { success: true, message: "Version published", data: null };
}

// ─── Create New Version (from published) ──────────────────────────────────────

export async function createNewVersion(templateId: string): Promise<ActionResult<{ versionId: string; versionNumber: number }>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  const supabase = createServerClient();

  // Get max version number
  const { data: versions } = await supabase
    .from("assessment_versions")
    .select("version_number")
    .eq("template_id", templateId)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersion = (versions?.[0]?.version_number || 0) + 1;

  const { data, error } = await supabase
    .from("assessment_versions")
    .insert({ template_id: templateId, version_number: nextVersion, status: "draft" })
    .select()
    .single();

  if (error) return { success: false, message: error.message, data: null };

  return { success: true, message: "New version created", data: { versionId: data.id, versionNumber: nextVersion } };
}

// ─── Update Question ──────────────────────────────────────────────────────────

export async function updateQuestion(
  questionId: string,
  updates: { questionText?: string; isReverseScored?: boolean; weight?: number; questionType?: string }
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};
  if (updates.questionText !== undefined) updateData.question_text = updates.questionText;
  if (updates.isReverseScored !== undefined) updateData.is_reverse_scored = updates.isReverseScored;
  if (updates.weight !== undefined) updateData.weight = updates.weight;
  if (updates.questionType !== undefined) updateData.question_type = updates.questionType;

  const { error } = await supabase
    .from("questions")
    .update(updateData)
    .eq("id", questionId);

  if (error) return { success: false, message: error.message, data: null };

  await logAudit({
    userId: session.userId,
    action: "question_updated",
    entityType: "question",
    entityId: questionId,
    metadata: updateData,
  });

  return { success: true, message: "Question updated", data: null };
}

// ─── Delete Question (soft) ───────────────────────────────────────────────────

export async function deleteQuestion(questionId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  const supabase = createServerClient();

  const { error } = await supabase
    .from("questions")
    .update({ deleted_at: new Date().toISOString(), deleted_by: session.userId })
    .eq("id", questionId);

  if (error) return { success: false, message: error.message, data: null };
  return { success: true, message: "Question deleted", data: null };
}

// ─── Update Category ──────────────────────────────────────────────────────────

export async function updateCategory(
  categoryId: string,
  updates: { name?: string; weight?: number }
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.weight !== undefined) updateData.weight = updates.weight;

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", categoryId);

  if (error) return { success: false, message: error.message, data: null };

  await logAudit({
    userId: session.userId,
    action: "category_updated",
    entityType: "category",
    entityId: categoryId,
    metadata: updateData,
  });

  return { success: true, message: "Category updated", data: null };
}

// ─── Delete Category (soft) ───────────────────────────────────────────────────

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  const supabase = createServerClient();

  // Soft delete the category
  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), deleted_by: session.userId })
    .eq("id", categoryId);

  if (error) return { success: false, message: error.message, data: null };

  // Also soft delete all questions in this category
  await supabase
    .from("questions")
    .update({ deleted_at: new Date().toISOString(), deleted_by: session.userId })
    .eq("category_id", categoryId);

  return { success: true, message: "Category deleted", data: null };
}
