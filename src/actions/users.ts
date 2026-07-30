"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession, type ActionResult } from "@/actions/auth";
import { hashPassword } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/lib/supabase/types";

interface CreateUserInput {
  email: string;
  password: string;
  role?: UserRole;
  organizationId?: string;
  name?: string;
  department?: string;
  designation?: string;
}

interface UserInfo {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
}

// ─── Create User ──────────────────────────────────────────────────────────────

export async function createUser(input: CreateUserInput): Promise<ActionResult<UserInfo>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  const { email, password, role, organizationId, name, department, designation } = input;

  if (!email || !password) {
    return { success: false, message: "Email and password are required", data: null };
  }

  const targetRole: UserRole = role || "employee";

  // Permission checks
  if (session.role === "org_admin") {
    if (targetRole !== "employee") return { success: false, message: "Can only create employees", data: null };
    if (organizationId && organizationId !== session.organizationId) {
      return { success: false, message: "Cannot create users for other organizations", data: null };
    }
  } else if (session.role !== "super_admin") {
    return { success: false, message: "Unauthorized", data: null };
  }

  const orgId = organizationId || session.organizationId;

  if (targetRole !== "super_admin" && !orgId) {
    return { success: false, message: "Organization is required", data: null };
  }

  const supabase = createServerClient();

  // Check duplicate
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing) return { success: false, message: "Email already exists", data: null };

  // Create user
  const passwordHash = hashPassword(password);

  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: targetRole,
      organization_id: orgId || null,
      is_active: true,
    })
    .select()
    .single();

  if (userError) return { success: false, message: userError.message, data: null };

  // Create employee profile if employee role
  if (targetRole === "employee" && orgId) {
    const { error: empError } = await supabase.from("employees").insert({
      user_id: user.id,
      organization_id: orgId,
      encrypted_name: encrypt(name || email.split("@")[0]),
      encrypted_department: encrypt(department || "Unassigned"),
      encrypted_designation: designation ? encrypt(designation) : null,
      status: "active",
    });

    if (empError) {
      await supabase.from("users").delete().eq("id", user.id);
      return { success: false, message: "Failed to create employee: " + empError.message, data: null };
    }
  }

  await logAudit({
    userId: session.userId,
    action: "employee_created",
    entityType: "user",
    entityId: user.id,
    metadata: { email: user.email, role: targetRole },
  });

  return {
    success: true,
    message: "User created",
    data: { id: user.id, email: user.email, role: targetRole, organizationId: orgId || null },
  };
}

// ─── List Users ───────────────────────────────────────────────────────────────

export async function getUsers(): Promise<ActionResult<UserInfo[]>> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated", data: null };

  const supabase = createServerClient();

  if (session.role === "super_admin") {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, role, organization_id, is_active, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) return { success: false, message: error.message, data: null };
    return {
      success: true,
      message: "Success",
      data: (data || []).map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role as UserRole,
        organizationId: u.organization_id,
      })),
    };
  }

  if (session.role === "org_admin" && session.organizationId) {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, role, organization_id")
      .eq("organization_id", session.organizationId)
      .eq("role", "employee")
      .is("deleted_at", null);

    if (error) return { success: false, message: error.message, data: null };
    return {
      success: true,
      message: "Success",
      data: (data || []).map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role as UserRole,
        organizationId: u.organization_id,
      })),
    };
  }

  return { success: false, message: "Unauthorized", data: null };
}
