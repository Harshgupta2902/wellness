"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Building2, Users, Activity, AlertTriangle, ShieldAlert, ClipboardList } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { getOrgDashboardData } from "@/actions/hr-dashboard";
import type { UserRole } from "@/lib/supabase/types";

interface OrgStats {
  totalAssessments: number;
  avgWellness: number;
  highRiskCount: number;
  assessments: {
    id: string;
    employeeName: string;
    department: string;
    overallScore: number;
    riskLevel: string;
    submittedAt: string;
  }[];
  categoryAverages: { category: string; average: number }[];
  riskDistribution: { level: string; count: number }[];
}

export default function HRDashboard() {
  return (
    <AuthGuard allowedRoles={["org_admin", "super_admin"]}>
      {(session) => <HRContent email={session.email} role={session.role} />}
    </AuthGuard>
  );
}

function HRContent({ email, role }: { email: string; role: UserRole }) {
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getOrgDashboardData();
      if (result.success && result.data) {
        setStats(result.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Header email={email} role={role} />
        <main className="flex items-center justify-center py-20">
          <Image src="/logo.png" alt="Loading" width={32} height={32} className="animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Header email={email} role={role} />

      <main className="max-w-7xl mx-auto px-6 py-8 page-enter">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#022932] flex items-center gap-3">
              <Building2 className="w-7 h-7 text-[#2a787c]" />
              HR Wellness Dashboard
            </h1>
            <p className="text-[#5b7a80] mt-1 text-sm">
              Aggregated metrics. Individual data is never exposed without consent.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            icon={<ClipboardList className="w-5 h-5" />}
            label="Total Assessments"
            value={stats?.totalAssessments || 0}
          />
          <KPICard
            icon={<Activity className="w-5 h-5" />}
            label="Avg Wellness Score"
            value={stats?.avgWellness || 0}
            suffix="/100"
          />
          <KPICard
            icon={<Users className="w-5 h-5" />}
            label="Unique Employees"
            value={stats?.assessments ? new Set(stats.assessments.map((a) => a.employeeName)).size : 0}
          />
          <KPICard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="High Risk"
            value={stats?.highRiskCount || 0}
            danger={true}
          />
        </div>

        {stats && stats.totalAssessments > 0 ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Category Averages */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3]">
              <h3 className="text-base font-bold text-[#022932] mb-4">Category Averages</h3>
              {stats.categoryAverages.length > 0 ? (
                <div className="space-y-4">
                  {stats.categoryAverages.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#022932]">{cat.category}</span>
                        <span className="font-semibold" style={{ color: getScoreColor(cat.average) }}>
                          {cat.average}%
                        </span>
                      </div>
                      <div className="w-full bg-[#d4e0e3] rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{ width: `${cat.average}%`, backgroundColor: getScoreColor(cat.average) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#8ba5aa] text-sm text-center py-4">No category data yet</p>
              )}
            </div>

            {/* Risk Distribution */}
            <div className="bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3]">
              <h3 className="text-base font-bold text-[#022932] mb-4">Risk Distribution</h3>
              <div className="space-y-3">
                {stats.riskDistribution.map((r) => (
                  <div key={r.level} className="flex items-center justify-between p-3 rounded-lg bg-[#f5fafa]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor(r.level) }} />
                      <span className="text-sm font-medium text-[#022932] capitalize">
                        {r.level.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#022932]">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* All Assessments Table */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3]">
              <h3 className="text-base font-bold text-[#022932] mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#2a787c]" />
                All Assessments
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#d4e0e3]">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-[#5b7a80] uppercase">Employee</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-[#5b7a80] uppercase">Department</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-[#5b7a80] uppercase">Score</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-[#5b7a80] uppercase">Risk</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-[#5b7a80] uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f7f8]">
                    {stats.assessments.map((a) => (
                      <tr key={a.id} className="hover:bg-[#fafcfc]">
                        <td className="py-3 px-2 font-medium text-[#022932]">{a.employeeName}</td>
                        <td className="py-3 px-2 text-[#5b7a80]">{a.department}</td>
                        <td className="py-3 px-2">
                          <span className="font-semibold" style={{ color: getScoreColor(a.overallScore) }}>
                            {a.overallScore}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getRiskBadge(a.riskLevel)}`}>
                            {a.riskLevel.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-[#5b7a80] text-xs">
                          {new Date(a.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 card-shadow border border-[#d4e0e3] text-center">
            <ClipboardList className="w-12 h-12 text-[#d4e0e3] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#022932] mb-2">No Assessments Yet</h2>
            <p className="text-[#5b7a80] text-sm max-w-md mx-auto">
              Once employees complete their assessments, aggregated wellness metrics will appear here.
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 bg-[#f0f7f8] border border-[#d4e0e3] rounded-2xl p-5 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-[#2a787c] flex-shrink-0" />
          <p className="text-xs text-[#5b7a80]">
            <strong className="text-[#022932]">Privacy:</strong> Only aggregated data is shown. Individual clinical details are never exposed without explicit consent.
          </p>
        </div>
      </main>
    </div>
  );
}

function KPICard({ icon, label, value, suffix, danger }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  danger?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 card-shadow border border-[#d4e0e3]">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${danger ? "bg-red-500" : "bg-[#022932]"}`}>
          {icon}
        </div>
        <div>
          <p className={`text-2xl font-bold ${danger && value > 0 ? "text-red-600" : "text-[#022932]"}`}>
            {value}{suffix && <span className="text-sm text-[#5b7a80] font-normal">{suffix}</span>}
          </p>
          <p className="text-xs text-[#5b7a80]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#2a787c";
  if (score >= 65) return "#d97706";
  if (score >= 50) return "#ea580c";
  return "#dc2626";
}

function getRiskColor(level: string): string {
  switch (level) {
    case "excellent": return "#10b981";
    case "healthy": return "#2a787c";
    case "moderate": return "#d97706";
    case "high_risk": return "#ea580c";
    case "critical": return "#dc2626";
    default: return "#5b7a80";
  }
}

function getRiskBadge(risk: string): string {
  switch (risk) {
    case "excellent":
    case "healthy":
      return "bg-[#2a787c]/10 text-[#2a787c]";
    case "moderate":
      return "bg-amber-100 text-amber-700";
    case "high_risk":
      return "bg-orange-100 text-orange-700";
    case "critical":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
