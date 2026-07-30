"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  Flame,
  Users,
  Target,
  Battery,
  Scale,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Star,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { getMyDashboardData } from "@/actions/employee-dashboard";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface DashboardData {
  hasAssessment: boolean;
  overallScore: number;
  riskLevel: string;
  submittedAt: string;
  categoryScores: { category: string; percentage: number }[];
}

export default function EmployeeDashboard() {
  return (
    <AuthGuard allowedRoles={["employee"]}>
      {(session) => <DashboardContent email={session.email} />}
    </AuthGuard>
  );
}

function DashboardContent({ email }: { email: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getMyDashboardData();
      if (result.success && result.data) setData(result.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Header email={email} role="employee" />
        <main className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#2a787c] animate-spin" />
        </main>
      </div>
    );
  }

  if (!data || !data.hasAssessment) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Header email={email} role="employee" />
        <main className="max-w-3xl mx-auto px-6 py-16 text-center page-enter">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <Image src="/logo.png" alt="" width={40} height={40} className="mx-auto mb-4 opacity-60" />
            <h2 className="text-xl font-bold text-[#022932] mb-2">Showing Sample Data</h2>
            <p className="text-sm text-amber-700 mb-4">
              You haven&apos;t completed an assessment yet. The dashboard will show your real data once you do.
            </p>
            <Link href="/assessment" className="btn-accent inline-flex items-center gap-2 text-sm">
              Take your assessment now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const categoryData = [
    { name: "Mental Wellbeing", icon: Brain, color: "#3b82f6" },
    { name: "Burnout", icon: Flame, color: "#ef4444" },
    { name: "Workplace Culture", icon: Users, color: "#8b5cf6" },
    { name: "Job Satisfaction", icon: Target, color: "#10b981" },
    { name: "Resilience", icon: Battery, color: "#f59e0b" },
    { name: "Work-Life Balance", icon: Scale, color: "#2a787c" },
  ];

  const scores = categoryData.map((cat) => {
    const found = data.categoryScores.find((cs) => cs.category === cat.name);
    return { ...cat, score: found?.percentage || 0 };
  });

  const radarData = {
    labels: scores.map((s) => s.name),
    datasets: [
      {
        label: "Your Scores",
        data: scores.map((s) => s.score),
        backgroundColor: "rgba(42, 120, 124, 0.15)",
        borderColor: "#2a787c",
        borderWidth: 2,
        pointBackgroundColor: "#2a787c",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20, display: false },
        grid: { color: "rgba(0,0,0,0.05)" },
        pointLabels: { font: { size: 11, family: "Montserrat" }, color: "#022932" },
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Header email={email} role="employee" />

      <main className="max-w-7xl mx-auto px-6 py-8 page-enter">
        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {scores.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="bg-white rounded-xl p-4 card-shadow border border-[#d4e0e3] text-center">
                <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: cat.color }} />
                <p className="text-2xl font-bold" style={{ color: cat.color }}>{cat.score}</p>
                <p className="text-[10px] text-[#5b7a80] mt-1 leading-tight">{cat.name}</p>
              </div>
            );
          })}
        </div>

        {/* Radar + Category Scores */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3]">
            <h3 className="text-base font-bold text-[#022932] mb-4">Wellness Profile</h3>
            <div className="max-w-sm mx-auto">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3]">
            <h3 className="text-base font-bold text-[#022932] mb-4">Category Scores</h3>
            <div className="space-y-4">
              {scores.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#022932]">{cat.name}</span>
                    <span className="font-bold" style={{ color: cat.color }}>{cat.score}%</span>
                  </div>
                  <div className="w-full bg-[#f0f7f8] rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights / Strengths / Recommendations (placeholders until AI is integrated) */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3]">
            <h3 className="text-base font-bold text-[#022932] mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#2a787c]" />
              AI Insights
            </h3>
            <div className="space-y-4">
              <InsightRow label="Overall Score" value={`${data.overallScore}/100`} color={getScoreColor(data.overallScore)} />
              <InsightRow label="Risk Level" value={formatRisk(data.riskLevel)} color={getRiskColor(data.riskLevel)} />
              <InsightRow label="Assessment Date" value={new Date(data.submittedAt).toLocaleDateString()} color="#5b7a80" />
            </div>
            <p className="text-[10px] text-[#8ba5aa] mt-4 pt-3 border-t border-[#f0f7f8]">
              Detailed AI analysis will be available after Gemini integration.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3]">
            <h3 className="text-base font-bold text-[#022932] mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Strengths
            </h3>
            <div className="space-y-2">
              {scores
                .filter((s) => s.score >= 70)
                .map((s) => (
                  <div key={s.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800">{s.name} ({s.score}%)</span>
                  </div>
                ))}
              {scores.filter((s) => s.score >= 70).length === 0 && (
                <p className="text-xs text-[#8ba5aa]">Complete more assessments to identify strengths.</p>
              )}
            </div>

            <h4 className="text-xs font-semibold text-[#022932] mt-5 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Areas of Concern
            </h4>
            <div className="space-y-2">
              {scores
                .filter((s) => s.score < 60)
                .map((s) => (
                  <div key={s.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50">
                    <span className="text-sm text-amber-800">{s.name} ({s.score}%)</span>
                  </div>
                ))}
              {scores.filter((s) => s.score < 60).length === 0 && (
                <p className="text-xs text-[#8ba5aa]">No major concerns identified.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3]">
            <h3 className="text-base font-bold text-[#022932] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2a787c]" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {getRecommendations(scores).map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f0f7f8]">
                  <ArrowRight className="w-3.5 h-3.5 text-[#2a787c] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#022932]">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Level Scale */}
        <div className="bg-white rounded-2xl p-6 card-shadow border border-[#d4e0e3] mb-8">
          <h3 className="text-base font-bold text-[#022932] mb-4">Risk Level Scale</h3>
          <div className="flex items-center gap-2">
            {[
              { label: "Critical", range: "<50", color: "bg-red-500" },
              { label: "High Risk", range: "50-64", color: "bg-orange-500" },
              { label: "Moderate", range: "65-79", color: "bg-amber-500" },
              { label: "Healthy", range: "80-89", color: "bg-[#2a787c]" },
              { label: "Excellent", range: "90-100", color: "bg-emerald-500" },
            ].map((level) => {
              const isActive = data.riskLevel === level.label.toLowerCase().replace(" ", "_");
              return (
                <div
                  key={level.label}
                  className={`flex-1 text-center p-3 rounded-xl transition-all ${
                    isActive ? `${level.color} text-white shadow-md scale-105` : "bg-[#f5fafa] text-[#5b7a80]"
                  }`}
                >
                  <div className="text-xs font-semibold">{level.label}</div>
                  <div className="text-[10px] opacity-75">{level.range}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-[#8ba5aa] py-4">
          This assessment supports employee wellbeing and is not intended to replace clinical evaluation or provide medical diagnoses.
        </p>
      </main>
    </div>
  );
}

function InsightRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#5b7a80]">{label}</span>
      <span className="text-sm font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#2a787c";
  if (score >= 65) return "#d97706";
  if (score >= 50) return "#ea580c";
  return "#dc2626";
}

function getRiskColor(risk: string): string {
  switch (risk) {
    case "excellent": case "healthy": return "#2a787c";
    case "moderate": return "#d97706";
    case "high_risk": return "#ea580c";
    case "critical": return "#dc2626";
    default: return "#5b7a80";
  }
}

function formatRisk(risk: string): string {
  return risk.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRecommendations(scores: { name: string; score: number }[]): string[] {
  const recs: string[] = [];
  const low = scores.filter((s) => s.score < 60);
  const medium = scores.filter((s) => s.score >= 60 && s.score < 75);

  if (low.some((s) => s.name === "Burnout")) recs.push("Discuss workload with your manager");
  if (low.some((s) => s.name === "Mental Wellbeing")) recs.push("Consider speaking with a wellness professional");
  if (low.some((s) => s.name === "Work-Life Balance")) recs.push("Set clear work-life boundaries");
  if (medium.some((s) => s.name === "Resilience")) recs.push("Practice mindfulness and stress management");
  if (medium.some((s) => s.name === "Workplace Culture")) recs.push("Engage in team building activities");

  if (recs.length === 0) recs.push("Continue maintaining your current wellness practices", "Regular exercise and sleep hygiene help sustain scores");

  return recs.slice(0, 4);
}
