/**
 * Authentication utilities for MVP.
 *
 * MVP approach: email + master password validation against the database.
 * Session managed via a simple JWT-like token stored in cookies.
 *
 * Future: Replace with full Supabase Auth.
 */

import crypto from "crypto";
import type { UserRole } from "@/lib/supabase/types";

const SESSION_SECRET = process.env.ENCRYPTION_KEY || "fallback-dev-key-not-for-production";
const TOKEN_EXPIRY_HOURS = 24;

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  expiresAt: number;
}

/**
 * Hash a password using bcrypt-compatible approach with crypto.
 * For MVP, we use a simple PBKDF2 hash since we're not using Supabase Auth yet.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
}

/**
 * Create a session token (simple signed JSON).
 */
export function createSessionToken(payload: Omit<SessionPayload, "expiresAt">): string {
  const session: SessionPayload = {
    ...payload,
    expiresAt: Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  };

  const data = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

/**
 * Verify and decode a session token.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("base64url");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) return null;

    const payload: SessionPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    );

    // Check expiry
    if (payload.expiresAt < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
