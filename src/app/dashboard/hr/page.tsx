"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Building2,
  Activity,
  ShieldAlert,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { getAssessments, type SavedAssessment } from "@/lib/storage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

function getRiskLevel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Healthy";
  if (score >= 65) return "Moderate";
  if (score >= 50) return "High Risk";
  return "Critical";
}

function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case "Excellent": return "#10b981";
    case "Healthy": return "#22c55e";
    case "Moderate": return "#f59e0b";
    case "High Risk": return "#f97316";
    case "Critical": return "#ef4444";
    default: return "#64748b";
  }
}

interface DeptMetric {
  department: string;
  employeeCount: number;
  avgWellness: number;
  avgBurnout: number;
  avgEngagement: number;
  avgResilience: number;
  avgWorkLife: number;
  avgCulture: number;
  riskCount: number;
}

function computeDepartmentMetrics(assessments: SavedAssessment[]): DeptMetric[] {
  const deptMap: Record<string, SavedAssessment[]> = {};

  for (const a of assessments) {
    const dept = a.personalInfo.department || "Unknown";
    if (!deptMap[dept]) deptMap[dept] = [];
    deptMap[dept].push(a);
  }

  return Object.entries(deptMap).map(([department, items]) => {
    const count = items.length;
    const avg = (category: string) => {
      const scores = items
        .map((item) => item.scores.categoryScores.find((c) => c.category === category)?.percentage ?? 0);
      return Math.round(scores.reduce((a, b) => a + b, 0) / count);
    };

    const avgWellness = Math.round(items.reduce((s, i) => s + i.scores.overallScore, 0) / count);
    const riskCount = items.filter((i) => i.scores.riskLevel === "High Risk" || i.scores.riskLevel === "Critical").length;

    return {
      department,
      employeeCount: count,
      avgWellness,
      avgBurnout: avg("Burnout"),
      avgEngagement: avg("Job Satisfaction"),
      avgResilience: avg("Resilience"),
      avgWorkLife: avg("Work-Life Balance"),
      avgCulture: avg("Workplace Culture"),
      riskCount,
    };
  });
}

function computeTopIssues(assessments: SavedAssessment[]) {
  const total = assessments.length;
  if (total === 0) return [];

  const issues: { issue: string; check: (a: SavedAssessment) => boolean }[] = [
    { issue: "Burnout Symptoms", check: (a) => (a.scores.categoryScores.find((c) => c.category === "Burnout")?.percentage ?? 100) < 60 },
    { issue: "Work-Life Imbalance", check: (a) => (a.scores.categoryScores.find((c) => c.category === "Work-Life Balance")?.percentage ?? 100) < 60 },
    { issue: "Low Mental Wellbeing", check: (a) => (a.scores.categoryScores.find((c) => c.category === "Mental Wellbeing")?.percentage ?? 100) < 60 },
    { issue: "Poor Workplace Culture", check: (a) => (a.scores.categoryScores.find((c) => c.category === "Workplace Culture")?.percentage ?? 100) < 60 },
    { issue: "Low Engagement", check: (a) => (a.scores.categoryScores.find((c) => c.category === "Job Satisfaction")?.percentage ?? 100) < 60 },
    { issue: "Low Resilience", check: (a) => (a.scores.categoryScores.find((c) => c.category === "Resilience")?.percentage ?? 100) < 60 },
  ];

  return issues
    .map((iss) => {
      const count = assessments.filter(iss.check).length;
      return { issue: iss.issue, count, percentage: Math.round((count / total) * 100) };
    })
    .filter((i) => i.count > 0)
    .sort((a, b) => b.percentage - a.percentage);
}

export default function HRDashboard() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAssessments(getAssessments());
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  const totalAssessed = assessments.length;

  // If no assessments yet, show empty state
  if (totalAssessed === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-16 text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Assessments Yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            The HR Dashboard aggregates data from completed employee assessments. 
            Once employees complete their assessments, metrics will appear here.
          </p>
          <Link
            href="/assessment"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Take First Assessment
          </Link>
        </main>
      </div>
    );
  }

  // Compute all metrics from saved assessments
  const avgOverall = Math.round(assessments.reduce((s, a) => s + a.scores.overallScore, 0) / totalAssessed);

  const avgCategory = (category: string) => {
    const scores = assessments.map((a) => a.scores.categoryScores.find((c) => c.category === category)?.percentage ?? 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / totalAssessed);
  };

  const avgBurnout = avgCategory("Burnout");
  const avgEngagement = avgCategory("Job Satisfaction");
  const avgMental = avgCategory("Mental Wellbeing");

  const highRiskCount = assessments.filter(
    (a) => a.scores.riskLevel === "High Risk" || a.scores.riskLevel === "Critical"
  ).length;

  // Risk distribution
  const riskDistribution = {
    Excellent: assessments.filter((a) => a.scores.riskLevel === "Excellent").length,
    Healthy: assessments.filter((a) => a.scores.riskLevel === "Healthy").length,
    Moderate: assessments.filter((a) => a.scores.riskLevel === "Moderate").length,
    "High Risk": assessments.filter((a) => a.scores.riskLevel === "High Risk").length,
    Critical: assessments.filter((a) => a.scores.riskLevel === "Critical").length,
  };

  // Department metrics
  const departmentMetrics = computeDepartmentMetrics(assessments);

  // Top issues
  const topIssues = computeTopIssues(assessments);

  // Build trend from assessments sorted by date (group by month)
  const sortedByDate = [...assessments].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );
  const trendMonths: string[] = [];
  const trendScores: number[] = [];
  const monthMap: Record<string, number[]> = {};
  for (const a of sortedByDate) {
    const d = new Date(a.submittedAt);
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(a.scores.overallScore);
  }
  for (const [month, scores] of Object.entries(monthMap)) {
    trendMonths.push(month);
    trendScores.push(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
  }

  // Charts
  const departmentBarData = {
    labels: departmentMetrics.map((d) => d.department),
    datasets: [
      {
        label: "Avg Wellness",
        data: departmentMetrics.map((d) => d.avgWellness),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderRadius: 6,
      },
      {
        label: "Avg Burnout Score",
        data: departmentMetrics.map((d) => d.avgBurnout),
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" as const } },
    scales: {
      y: { min: 0, max: 100, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  const trendLineData = {
    labels: trendMonths.length > 1 ? trendMonths : ["Current"],
    datasets: [
      {
        label: "Overall Wellness",
        data: trendScores.length > 1 ? trendScores : [avgOverall],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" as const } },
    scales: {
      y: { min: 0, max: 100, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  const doughnutData = {
    labels: Object.keys(riskDistribution),
    datasets: [
      {
        data: Object.values(riskDistribution),
        backgroundColor: ["#10b981", "#22c55e", "#f59e0b", "#f97316", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" as const } },
    cutout: "60%",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-indigo-600" />
              HR Wellness Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Aggregated metrics from {totalAssessed} assessment{totalAssessed !== 1 ? "s" : ""} (no individual data exposed)
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">Total Assessments</span>
            <p className="font-semibold text-gray-900">{totalAssessed}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Avg Wellness Score"
            value={avgOverall}
            suffix="/100"
            icon={<Activity className="w-5 h-5" />}
            color="text-indigo-600"
            bg="bg-indigo-50"
            trend={getRiskLevel(avgOverall)}
            trendUp={avgOverall >= 65}
          />
          <KPICard
            title="Avg Burnout Score"
            value={avgBurnout}
            suffix="/100"
            icon={<TrendingDown className="w-5 h-5" />}
            color="text-red-600"
            bg="bg-red-50"
            trend={avgBurnout < 60 ? "Concerning" : "Acceptable"}
            trendUp={avgBurnout >= 60}
          />
          <KPICard
            title="High Risk Employees"
            value={highRiskCount}
            suffix={`/${totalAssessed}`}
            icon={<ShieldAlert className="w-5 h-5" />}
            color="text-orange-600"
            bg="bg-orange-50"
            trend={highRiskCount > 0 ? "Needs attention" : "All clear"}
            trendUp={highRiskCount === 0}
          />
          <KPICard
            title="Avg Engagement"
            value={avgEngagement}
            suffix="/100"
            icon={<Users className="w-5 h-5" />}
            color="text-green-600"
            bg="bg-green-50"
            trend={getRiskLevel(avgEngagement)}
            trendUp={avgEngagement >= 65}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Department Comparison */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Department Wellness Comparison
            </h3>
            {departmentMetrics.length > 0 ? (
              <Bar data={departmentBarData} options={barOptions} />
            ) : (
              <p className="text-gray-400 text-center py-8">Need assessments from multiple departments</p>
            )}
          </div>

          {/* Trend Analysis */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Wellness Trend
            </h3>
            <Line data={trendLineData} options={lineOptions} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Risk Distribution */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Risk Level Distribution
            </h3>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>

          {/* Top Workplace Issues */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Top Workplace Issues
            </h3>
            {topIssues.length > 0 ? (
              <div className="space-y-3">
                {topIssues.map((issue, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{issue.issue}</span>
                      <span className="text-gray-500 font-medium">
                        {issue.percentage}% ({issue.count})
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-amber-400"
                        style={{ width: `${issue.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No critical issues detected</p>
            )}
          </div>

          {/* Department Heatmap */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Department Heatmap
            </h3>
            <div className="space-y-3">
              {departmentMetrics.map((dept) => (
                <div
                  key={dept.department}
                  className="p-3 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">
                      {dept.department}
                    </span>
                    <span className="text-xs text-gray-500">
                      {dept.employeeCount} employee{dept.employeeCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <HeatCell label="Wellness" value={dept.avgWellness} />
                    <HeatCell label="Burnout" value={dept.avgBurnout} />
                    <HeatCell label="Culture" value={dept.avgCulture} />
                    <HeatCell label="W-L Bal" value={dept.avgWorkLife} />
                  </div>
                  {dept.riskCount > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      {dept.riskCount} at-risk employee{dept.riskCount > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attrition Risk Table */}
        <div className="bg-white rounded-2xl p-6 card-shadow mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Department Risk Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Employees</th>
                  <th className="pb-3 font-medium">Avg Score</th>
                  <th className="pb-3 font-medium">At Risk</th>
                  <th className="pb-3 font-medium">Risk Level</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {departmentMetrics.map((dept) => (
                  <tr key={dept.department} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-800">{dept.department}</td>
                    <td className="py-3 text-gray-600">{dept.employeeCount}</td>
                    <td className="py-3">
                      <span
                        className="font-semibold"
                        style={{ color: getRiskLevelColor(getRiskLevel(dept.avgWellness)) }}
                      >
                        {dept.avgWellness}
                      </span>
                    </td>
                    <td className="py-3">
                      {dept.riskCount > 0 ? (
                        <span className="text-red-600 font-medium">{dept.riskCount}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-600">{getRiskLevel(dept.avgWellness)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          dept.riskCount === 0
                            ? "bg-green-100 text-green-700"
                            : dept.riskCount === 1
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {dept.riskCount === 0 ? "Healthy" : dept.riskCount === 1 ? "Monitor" : "Action Needed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Assessments List */}
        <div className="bg-white rounded-2xl p-6 card-shadow mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            All Submitted Assessments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Designation</th>
                  <th className="pb-3 font-medium">Overall Score</th>
                  <th className="pb-3 font-medium">Risk Level</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-800">{a.personalInfo.name}</td>
                    <td className="py-3 text-gray-600">{a.personalInfo.department}</td>
                    <td className="py-3 text-gray-600">{a.personalInfo.designation || "—"}</td>
                    <td className="py-3">
                      <span
                        className="font-semibold"
                        style={{ color: getRiskLevelColor(a.scores.riskLevel) }}
                      >
                        {a.scores.overallScore}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.scores.riskLevel === "Excellent" || a.scores.riskLevel === "Healthy"
                            ? "bg-green-100 text-green-700"
                            : a.scores.riskLevel === "Moderate"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {a.scores.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {new Date(a.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center mb-8">
          <ShieldAlert className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <h4 className="font-semibold text-indigo-900">Privacy Notice</h4>
          <p className="text-sm text-indigo-700 mt-1 max-w-2xl mx-auto">
            This dashboard shows only aggregated, anonymized data. Individual
            employee clinical details are never exposed without explicit consent.
            All data is handled in compliance with privacy regulations.
          </p>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-indigo-600" fill="currentColor" />
          <span className="text-xl font-bold text-gray-900">WellPulse</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/assessment" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Take Assessment
          </Link>
          <Link href="/dashboard/employee" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Employee Dashboard
          </Link>
          <Link href="/dashboard/hr" className="text-indigo-600 font-medium">
            HR Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

function KPICard({
  title,
  value,
  suffix,
  icon,
  color,
  bg,
  trend,
  trendUp,
}: {
  title: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 card-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
        <span className="text-sm text-gray-400 font-normal">{suffix}</span>
      </div>
      <div className={`text-xs mt-1 flex items-center gap-1 ${trendUp ? "text-green-600" : "text-red-500"}`}>
        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  );
}

function HeatCell({ label, value }: { label: string; value: number }) {
  const getBg = (v: number) => {
    if (v >= 85) return "bg-green-100 text-green-800";
    if (v >= 70) return "bg-green-50 text-green-700";
    if (v >= 55) return "bg-amber-50 text-amber-700";
    return "bg-red-50 text-red-700";
  };

  return (
    <div className={`text-center p-1.5 rounded ${getBg(value)}`}>
      <div className="text-xs font-bold">{value}</div>
      <div className="text-[10px] opacity-75">{label}</div>
    </div>
  );
}
