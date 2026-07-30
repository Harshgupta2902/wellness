"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, AlertCircle, Users, Activity, Loader2 } from "lucide-react";
import { getSession } from "@/actions/auth";

export default function HRDashboard() {
  const [loading, setLoading] = useState(true);
  const [notAuthed, setNotAuthed] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    async function load() {
      const session = await getSession();
      if (!session || (session.role !== "org_admin" && session.role !== "super_admin")) {
        setNotAuthed(true);
        setLoading(false);
        return;
      }
      setRole(session.role);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Header />
        <main className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#2a787c] animate-spin" />
        </main>
      </div>
    );
  }

  if (notAuthed) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Header />
        <main className="max-w-lg mx-auto px-6 py-20 text-center page-enter">
          <AlertCircle className="w-12 h-12 text-[#2a787c] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#022932] mb-2">Access Restricted</h2>
          <p className="text-[#5b7a80] mb-6">This dashboard is available for Organization Admins and Super Admins.</p>
          <Link href="/login" className="btn-primary inline-block">Sign In</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 page-enter">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#022932] flex items-center gap-3">
              <Building2 className="w-7 h-7 text-[#2a787c]" />
              HR Wellness Dashboard
            </h1>
            <p className="text-[#5b7a80] mt-1 text-sm">
              Aggregated metrics from employee assessments. Individual data is never exposed.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#2a787c]/10 text-[#2a787c] text-xs font-semibold">
            {role === "super_admin" ? "Super Admin" : "Org Admin"}
          </span>
        </div>

        {/* Placeholder content - will be populated once assessments exist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard icon={<Activity className="w-5 h-5" />} label="Avg Wellness" value="—" />
          <KPICard icon={<Users className="w-5 h-5" />} label="Total Assessed" value="—" />
          <KPICard icon={<AlertCircle className="w-5 h-5" />} label="At Risk" value="—" />
        </div>

        <div className="bg-white rounded-2xl p-10 card-shadow border border-[#d4e0e3] text-center">
          <Building2 className="w-12 h-12 text-[#d4e0e3] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#022932] mb-2">Dashboard Ready</h2>
          <p className="text-[#5b7a80] text-sm max-w-md mx-auto mb-6">
            Once employees complete their assessments, aggregated wellness metrics,
            department comparisons, risk distributions, and trend charts will appear here.
          </p>
          <Link href="/admin" className="text-[#2a787c] font-medium text-sm hover:underline">
            Go to Admin Panel →
          </Link>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-[#f0f7f8] border border-[#d4e0e3] rounded-2xl p-6 text-center">
          <p className="text-sm text-[#5b7a80]">
            <strong className="text-[#022932]">Privacy:</strong> Only aggregated, anonymized data is shown.
            Individual employee details are never exposed without explicit consent.
          </p>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-[#d4e0e3] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Manovyatha" width={32} height={32} />
          <span className="text-xl font-bold text-[#022932]">Manovyatha</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard/employee" className="text-[#5b7a80] hover:text-[#022932] font-medium text-sm transition-colors">Employee</Link>
          <span className="text-[#2a787c] font-medium text-sm">HR Dashboard</span>
        </nav>
      </div>
    </header>
  );
}

function KPICard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-[#d4e0e3]">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#022932] flex items-center justify-center text-white">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-[#022932]">{value}</p>
          <p className="text-xs text-[#5b7a80]">{label}</p>
        </div>
      </div>
    </div>
  );
}
