"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ClipboardList, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { getSession } from "@/actions/auth";
import { getMyAssessments } from "@/actions/assessments";

interface AssessmentRecord {
  id: string;
  overall_score: number | null;
  risk_level: string | null;
  submitted_at: string;
}

export default function EmployeeDashboard() {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notAuthed, setNotAuthed] = useState(false);

  useEffect(() => {
    async function load() {
      const session = await getSession();
      if (!session || session.role !== "employee") {
        setNotAuthed(true);
        setLoading(false);
        return;
      }

      const result = await getMyAssessments();
      if (result.success && result.data) {
        setAssessments(result.data);
      }
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
          <h2 className="text-xl font-bold text-[#022932] mb-2">Sign In Required</h2>
          <p className="text-[#5b7a80] mb-6">Please login as an employee to view your dashboard.</p>
          <Link href="/login" className="btn-primary inline-block">Sign In</Link>
        </main>
      </div>
    );
  }

  const latest = assessments[0];

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8 page-enter">
        {/* Welcome */}
        <div className="gradient-bg rounded-2xl p-8 text-white mb-8">
          <h1 className="text-2xl font-bold mb-1">My Wellness Dashboard</h1>
          <p className="text-[#b8ced2]">
            {assessments.length > 0
              ? `You have ${assessments.length} assessment${assessments.length !== 1 ? "s" : ""} on record.`
              : "Take your first assessment to see your wellness insights."}
          </p>
        </div>

        {assessments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 card-shadow border border-[#d4e0e3] text-center">
            <ClipboardList className="w-12 h-12 text-[#d4e0e3] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#022932] mb-2">No Assessments Yet</h2>
            <p className="text-[#5b7a80] mb-6">Complete your first wellness assessment to see insights here.</p>
            <Link href="/assessment" className="btn-accent inline-flex items-center gap-2">
              Take Assessment <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Latest Score */}
            {latest && (
              <div className="bg-white rounded-2xl p-8 card-shadow border border-[#d4e0e3]">
                <h3 className="text-lg font-bold text-[#022932] mb-4">Latest Assessment</h3>
                <div className="flex items-center gap-8">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white ${getScoreBg(latest.overall_score || 0)}`}>
                    {latest.overall_score ?? "—"}
                  </div>
                  <div>
                    <p className="text-sm text-[#5b7a80]">Overall Wellness Score</p>
                    <p className={`text-sm font-semibold mt-1 ${getRiskColor(latest.risk_level || "")}`}>
                      {formatRisk(latest.risk_level || "")}
                    </p>
                    <p className="text-xs text-[#8ba5aa] mt-2">
                      Submitted: {new Date(latest.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            <div className="bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3]">
              <h3 className="text-lg font-bold text-[#022932] mb-4">Assessment History</h3>
              <div className="space-y-3">
                {assessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-[#d4e0e3]">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${getScoreBg(a.overall_score || 0)}`}>
                        {a.overall_score ?? "—"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#022932]">
                          {formatRisk(a.risk_level || "")}
                        </p>
                        <p className="text-xs text-[#8ba5aa]">
                          {new Date(a.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link href="/assessment" className="btn-accent inline-flex items-center gap-2">
                Take New Assessment <TrendingUp className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
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
          <Link href="/assessment" className="text-[#5b7a80] hover:text-[#022932] font-medium text-sm transition-colors">Assessment</Link>
          <span className="text-[#2a787c] font-medium text-sm">My Dashboard</span>
        </nav>
      </div>
    </header>
  );
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-[#2a787c]";
  if (score >= 65) return "bg-[#d97706]";
  if (score >= 50) return "bg-[#ea580c]";
  return "bg-[#dc2626]";
}

function getRiskColor(risk: string): string {
  switch (risk) {
    case "excellent":
    case "healthy":
      return "text-[#2a787c]";
    case "moderate":
      return "text-[#d97706]";
    default:
      return "text-[#dc2626]";
  }
}

function formatRisk(risk: string): string {
  return risk.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
