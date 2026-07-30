"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession, type ActionResult } from "@/actions/auth";
import { logAudit } from "@/lib/audit";
import type { Organization } from "@/lib/supabase/types";

// ─── List Organizations ───────────────────────────────────────────────────────

export async function getOrganizations(): Promise<ActionResult<Organization[]>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  const supabase = createServerClient();

  if (session.role === "super_admin") {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) return { success: false, message: error.message, data: null };
    return { success: true, message: "Success", data: data as Organization[] };
  }

  if (session.role === "org_admin" && session.organizationId) {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", session.organizationId)
      .is("deleted_at", null);

    if (error) return { success: false, message: error.message, data: null };
    return { success: true, message: "Success", data: data as Organization[] };
  }

  return { success: false, message: "Unauthorized", data: null };
}

// ─── Get Single Organization ──────────────────────────────────────────────────

export async function getOrganization(id: string): Promise<ActionResult<Organization>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  if (session.role === "org_admin" && session.organizationId !== id) {
    return { success: false, message: "Unauthorized", data: null };
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return { success: false, message: "Not found", data: null };
  return { success: true, message: "Success", data: data as Organization };
}

// ─── Create Organization ──────────────────────────────────────────────────────

export async function createOrganization(name: string, industry?: string): Promise<ActionResult<Organization>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  if (!name?.trim()) return { success: false, message: "Name is required", data: null };

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: name.trim(),
      industry: industry?.trim() || null,
      employee_count: 0,
      status: "active",
    })
    .select()
    .single();

  if (error) return { success: false, message: error.message, data: null };

  await logAudit({
    userId: session.userId,
    action: "organization_created",
    entityType: "organization",
    entityId: data.id,
    metadata: { name },
  });

  return { success: true, message: "Organization created", data: data as Organization };
}

// ─── Update Organization ──────────────────────────────────────────────────────

export async function updateOrganization(
  id: string,
  updates: { name?: string; industry?: string; status?: string }
): Promise<ActionResult<Organization>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name.trim();
  if (updates.industry !== undefined) updateData.industry = updates.industry.trim();
  if (updates.status !== undefined) updateData.status = updates.status;

  const { data, error } = await supabase
    .from("organizations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, message: error.message, data: null };

  await logAudit({
    userId: session.userId,
    action: "organization_updated",
    entityType: "organization",
    entityId: id,
    metadata: updateData,
  });

  return { success: true, message: "Organization updated", data: data as Organization };
}

// ─── Delete Organization (Soft) ───────────────────────────────────────────────

export async function deleteOrganization(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };
  if (session.role !== "super_admin") return { success: false, message: "Unauthorized", data: null };

  const supabase = createServerClient();

  const { error } = await supabase
    .from("organizations")
    .update({ deleted_at: new Date().toISOString(), deleted_by: session.userId })
    .eq("id", id);

  if (error) return { success: false, message: error.message, data: null };
  return { success: true, message: "Organization deleted", data: null };
}
