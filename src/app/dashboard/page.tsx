"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/actions/auth";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      const session = await getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      switch (session.role) {
        case "super_admin":
          router.push("/admin");
          break;
        case "org_admin":
          router.push("/dashboard/hr");
          break;
        case "employee":
          router.push("/dashboard/employee");
          break;
        default:
          router.push("/login");
      }
    }
    redirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
      <div className="text-center">
        <Image src="/logo.png" alt="Loading" width={32} height={32} className="mx-auto mb-3 animate-pulse" />
        <p className="text-[#5b7a80] text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
