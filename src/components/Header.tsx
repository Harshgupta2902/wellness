"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/supabase/types";

interface HeaderProps {
  email: string;
  role: UserRole;
}

const NAV_LINKS: Record<UserRole, { label: string; href: string }[]> = {
  super_admin: [
    { label: "Dashboard", href: "/admin" },
    { label: "Assessments", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Organizations", href: "/admin" },
  ],
  org_admin: [
    { label: "Dashboard", href: "/dashboard/hr" },
    { label: "Employees", href: "/dashboard/hr" },
  ],
  employee: [
    { label: "Dashboard", href: "/dashboard/employee" },
    { label: "Assessment", href: "/assessment" },
  ],
};

export default function Header({ email, role }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const links = NAV_LINKS[role] || [];

  return (
    <header className="bg-white border-b border-[#d4e0e3] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Manovyatha" width={30} height={30} />
            <span className="text-lg font-bold text-[#022932]">Manovyatha</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[#5b7a80] hover:text-[#022932] font-medium text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#5b7a80] hidden sm:inline">{email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[#5b7a80] hover:text-red-600 font-medium text-sm transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
