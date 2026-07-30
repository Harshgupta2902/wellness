"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/actions/auth";
import type { UserRole } from "@/lib/supabase/types";
import type { SessionData } from "@/actions/auth";

interface AuthGuardProps {
  allowedRoles: UserRole[];
  children: (session: SessionData) => React.ReactNode;
}

const ROLE_DASHBOARD: Record<UserRole, string> = {
  super_admin: "/admin",
  org_admin: "/dashboard/hr",
  employee: "/dashboard/employee",
};

export default function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const s = await getSession();

      if (!s) {
        router.push("/login");
        return;
      }

      if (!allowedRoles.includes(s.role)) {
        router.push(ROLE_DASHBOARD[s.role] || "/");
        return;
      }

      setSession(s);
      setChecking(false);
    }
    check();
  }, [allowedRoles, router]);

  if (checking || !session) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <Image src="/logo.png" alt="Loading" width={32} height={32} className="mx-auto mb-3 animate-pulse" />
        </div>
      </div>
    );
  }

  return <>{children(session)}</>;
}
