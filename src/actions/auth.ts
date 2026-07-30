"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/lib/supabase/types";

const COOKIE_NAME = "manovyatha_session";

export interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<ActionResult<SessionData>> {
  if (!email || !password) {
    return { success: false, message: "Email and password are required", data: null };
  }

  const supabase = createServerClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (error || !user) {
    return { success: false, message: "Invalid email or password", data: null };
  }

  const isValid = verifyPassword(password, user.password_hash);
  if (!isValid) {
    return { success: false, message: "Invalid email or password", data: null };
  }

  // Create session token
  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    organizationId: user.organization_id,
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  // Update last login
  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  await logAudit({
    userId: user.id,
    action: "login",
    entityType: "user",
    entityId: user.id,
  });

  return {
    success: true,
    message: "Login successful",
    data: {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      organizationId: user.organization_id,
    },
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<ActionResult> {
  const session = await getSession();

  if (session) {
    await logAudit({
      userId: session.userId,
      action: "logout",
      entityType: "user",
      entityId: session.userId,
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });

  return { success: true, message: "Logged out", data: null };
}

// ─── Get Session ──────────────────────────────────────────────────────────────

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    organizationId: payload.organizationId,
  };
}

// ─── Setup (Create Super Admin) ──────────────────────────────────────────────

export async function setupSuperAdmin(): Promise<ActionResult> {
  const supabase = createServerClient();

  const passwordHash = hashPassword("Wellness@12345");

  // Check if super admin already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id, password_hash")
    .eq("email", "admin@manovyatha.com")
    .limit(1)
    .single();

  if (existing) {
    // If exists but has a placeholder/broken hash, fix it
    const isValid = verifyPassword("Wellness@12345", existing.password_hash);
    if (isValid) {
      return { success: false, message: "Super Admin already exists and password is correct. Go to login.", data: null };
    }

    // Update with correct password hash
    await supabase
      .from("users")
      .update({ password_hash: passwordHash, is_active: true, role: "super_admin" })
      .eq("id", existing.id);

    return {
      success: true,
      message: "Super Admin password reset. Login with admin@manovyatha.com / Wellness@12345",
      data: { id: existing.id },
    };
  }

  // Create new
  const { data: admin, error } = await supabase
    .from("users")
    .insert({
      email: "admin@manovyatha.com",
      password_hash: passwordHash,
      role: "super_admin",
      is_active: true,
    })
    .select("id, email, role")
    .single();

  if (error) {
    return { success: false, message: "Failed: " + error.message, data: null };
  }

  return {
    success: true,
    message: "Super Admin created. Login with admin@manovyatha.com / Wellness@12345",
    data: admin,
  };
}
