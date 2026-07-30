"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  ClipboardList,
  Plus,
  Shield,
  ArrowRight,
  X,
  Users,
} from "lucide-react";
import { getOrganizations, createOrganization } from "@/actions/organizations";
import { getTemplates } from "@/actions/assessment-builder";
import type { Organization } from "@/lib/supabase/types";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

interface TemplateInfo {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  versions: { id: string; version_number: number; status: string; published_at: string | null }[];
}

export default function AdminDashboard() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      {(session) => <AdminContent email={session.email} />}
    </AuthGuard>
  );
}

function AdminContent({ email }: { email: string }) {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgIndustry, setNewOrgIndustry] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [orgsResult, templatesResult] = await Promise.all([
        getOrganizations(),
        getTemplates(),
      ]);

      if (orgsResult.success && orgsResult.data) setOrganizations(orgsResult.data);
      if (templatesResult.success && templatesResult.data) setTemplates(templatesResult.data);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    const result = await createOrganization(newOrgName, newOrgIndustry);
    if (result.success && result.data) {
      setOrganizations((prev) => [result.data!, ...prev]);
      setNewOrgName("");
      setNewOrgIndustry("");
      setShowOrgForm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/logo.png" alt="Manovyatha" width={32} height={32} className="mx-auto mb-3 animate-pulse" />
          <p className="text-[#5b7a80] text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={email} role="super_admin" />

      <main className="max-w-7xl mx-auto px-6 py-8 page-enter">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage organizations, assessment templates, and users.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={<Building2 className="w-5 h-5" />}
            label="Organizations"
            value={organizations.length}
            gradient="from-[#022932] to-[#064a56]"
          />
          <StatCard
            icon={<ClipboardList className="w-5 h-5" />}
            label="Templates"
            value={templates.length}
            gradient="from-[#2a787c] to-[#3a9ca0]"
          />
          <StatCard
            icon={<Shield className="w-5 h-5" />}
            label="Published"
            value={templates.filter((t) => t.versions.some((v) => v.status === "published")).length}
            gradient="from-[#1f5c5f] to-[#2a787c]"
          />
          <Link href="/admin/users" className="block">
            <div className="bg-white rounded-2xl p-5 card-shadow border border-[#d4e0e3] hover:border-[#2a787c] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#022932] to-[#2a787c] flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2a787c]">Manage Users →</p>
                  <p className="text-xs text-[#5b7a80]">Create & manage</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Organizations */}
          <section className="bg-white rounded-2xl p-6 card-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Organizations
              </h2>
              <button
                onClick={() => setShowOrgForm(!showOrgForm)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                {showOrgForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {showOrgForm ? "Cancel" : "Add"}
              </button>
            </div>

            {showOrgForm && (
              <form onSubmit={handleCreateOrg} className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="Organization Name *"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Industry (optional)"
                  value={newOrgIndustry}
                  onChange={(e) => setNewOrgIndustry(e.target.value)}
                  className="input-field"
                />
                <button type="submit" className="btn-primary w-full !py-2.5 text-sm">
                  Create Organization
                </button>
              </form>
            )}

            {organizations.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No organizations yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{org.name}</p>
                      <p className="text-xs text-gray-400">
                        {org.industry || "—"} · {org.employee_count} employees
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Templates */}
          <section className="bg-white rounded-2xl p-6 card-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-green-600" />
                Assessment Templates
              </h2>
              <Link
                href="/admin/assessments/new"
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                New
              </Link>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No templates yet</p>
                <Link href="/admin/assessments/new" className="text-indigo-600 text-xs font-medium hover:underline mt-1 inline-block">
                  Create your first →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {templates.map((t) => {
                  const publishedVersion = t.versions.find((v) => v.status === "published");
                  const latestVersion = t.versions[0];
                  return (
                    <Link
                      key={t.id}
                      href={`/admin/assessments/${t.id}/${latestVersion?.id || ""}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-green-100 hover:bg-green-50/30 transition-colors group block"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">
                            {t.versions.length} version{t.versions.length !== 1 ? "s" : ""}
                          </span>
                          {publishedVersion && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">
                              LIVE v{publishedVersion.version_number}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
