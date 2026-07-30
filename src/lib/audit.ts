/**
 * Audit logging utility.
 * Tracks all significant actions in the system.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { AuditAction } from "@/lib/supabase/types";

export async function logAudit(params: {
  userId: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  const supabase = createServerClient();

  await supabase.from("audit_logs").insert({
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType || null,
    entity_id: params.entityId || null,
    metadata: params.metadata || {},
    ip_address: params.ipAddress || null,
  });
}
