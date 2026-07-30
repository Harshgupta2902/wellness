"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Brain,
  Flame,
  Users,
  Target,
  Battery,
  Scale,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Star,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import {
  employees,
  assessmentResults,
  aiAnalyses,
  getScoreColor,
} from "@/data/mock-data";
import { getLatestAssessment, type SavedAssessment } from "@/lib/storage";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

export default function EmployeeDashboard() {
  const [savedData, setSavedData] = useState<SavedAssessment | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSavedData(getLatestAssessment());
  }, []);

  // Prevent hydration mismatch - render nothing meaningful until client mounts
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

  // Use saved assessment if available, otherwise fall back to mock
  const usingSavedData = savedData !== null;

  const employeeName = usingSavedData ? savedData.personalInfo.name : employees[0].name;
  const employeeDept = usingSavedData ? savedData.personalInfo.department : employees[0].department;
  const employeeDesignation = usingSavedData ? (savedData.personalInfo.designation || "Employee") : employees[0].designation;
  const assessmentDate = usingSavedData
    ? new Date(savedData.submittedAt).toLocaleDateString()
    : assessmentResults[0].assessmentDate;

  // Build scores from saved data or mock
  const getScore = (category: string): number => {
    if (usingSavedData && savedData) {
      const found = savedData.scores.categoryScores.find((c) => c.category === category);
      return found ? found.percentage : 0;
    }
    return 0;
  };

  const overallScore = usingSavedData ? savedData.scores.overallScore : assessmentResults[0].overallScore;
  const riskLevel = usingSavedData ? savedData.scores.riskLevel : assessmentResults[0].riskLevel;

  const mentalScore = usingSavedData ? getScore("Mental Wellbeing") : assessmentResults[0].mentalScore;
  const burnoutScore = usingSavedData ? getScore("Burnout") : assessmentResults[0].burnoutScore;
  const cultureScore = usingSavedData ? getScore("Workplace Culture") : assessmentResults[0].cultureScore;
  const engagementScore = usingSavedData ? getScore("Job Satisfaction") : assessmentResults[0].engagementScore;
  const resilienceScore = usingSavedData ? getScore("Resilience") : assessmentResults[0].resilienceScore;
  const worklifeScore = usingSavedData ? getScore("Work-Life Balance") : assessmentResults[0].worklifeScore;

  // AI Analysis - use mock for now (AI integration would go here)
  const aiAnalysis = aiAnalyses["emp-001"];

  const categoryData = [
    { name: "Mental Wellbeing", score: mentalScore, icon: Brain, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Burnout", score: burnoutScore, icon: Flame, color: "text-red-600", bg: "bg-red-50" },
    { name: "Culture", score: cultureScore, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Engagement", score: engagementScore, icon: Target, color: "text-green-600", bg: "bg-green-50" },
    { name: "Resilience", score: resilienceScore, icon: Battery, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Work-Life Balance", score: worklifeScore, icon: Scale, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  const radarData = {
    labels: categoryData.map((c) => c.name),
    datasets: [
      {
        label: "Your Scores",
        data: categoryData.map((c) => c.score),
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20, display: false },
        grid: { color: "rgba(0,0,0,0.05)" },
        pointLabels: { font: { size: 11 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="gradient-bg rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome back, {employeeName}
              </h1>
              <p className="text-indigo-100">
                {employeeDesignation} · {employeeDept} · Last assessed:{" "}
                {assessmentDate}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{overallScore}</div>
              <div className="text-indigo-200 text-sm">Overall Wellness</div>
            </div>
          </div>
        </div>

        {/* Score Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categoryData.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="bg-white rounded-xl p-4 card-shadow text-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${cat.bg} ${cat.color} mb-2`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: getScoreColor(cat.score) }}
                >
                  {cat.score}
                </div>
                <div className="text-xs text-gray-500 mt-1">{cat.name}</div>
              </div>
            );
          })}
        </div>

        {/* Radar Chart */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Wellness Profile
            </h3>
            <Radar data={radarData} options={radarOptions} />
          </div>

          {/* Score Summary */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Category Scores
            </h3>
            <div className="space-y-4">
              {categoryData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <span className="font-semibold" style={{ color: getScoreColor(cat.score) }}>
                      {cat.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        cat.score >= 80
                          ? "bg-green-500"
                          : cat.score >= 65
                          ? "bg-amber-500"
                          : cat.score >= 50
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* AI Insights */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              AI Insights
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Stress Level</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: getScoreColor(100 - aiAnalysis.stressScore) }}
                  >
                    {aiAnalysis.stressScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-orange-500"
                    style={{ width: `${aiAnalysis.stressScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Burnout Risk</span>
                  <span className="text-sm font-semibold text-amber-600">
                    {aiAnalysis.burnoutRisk}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Sentiment</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: getScoreColor(aiAnalysis.overallSentiment) }}
                  >
                    {aiAnalysis.overallSentiment}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${aiAnalysis.overallSentiment}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Manager Relationship</p>
                <p className="text-sm text-gray-700">{aiAnalysis.managerRelationship}</p>
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Strengths
            </h3>
            <div className="space-y-3">
              {aiAnalysis.strengths.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-800">{s}</span>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-semibold text-gray-700 mt-6 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Concerns
            </h4>
            <div className="space-y-2">
              {aiAnalysis.concerns.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-50"
                >
                  <span className="text-sm text-amber-800">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {aiAnalysis.recommendations.map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50"
                >
                  <ArrowRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-indigo-800">{r}</span>
                </div>
              ))}
            </div>

            {aiAnalysis.riskFlags.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-gray-700 mt-6 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  Risk Flags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.riskFlags.map((flag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Risk Level Indicator */}
        <div className="bg-white rounded-2xl p-6 card-shadow mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Risk Level Scale
          </h3>
          <div className="flex items-center gap-2">
            {[
              { label: "Critical", range: "<50", color: "bg-red-500" },
              { label: "High Risk", range: "50-64", color: "bg-orange-500" },
              { label: "Moderate", range: "65-79", color: "bg-amber-500" },
              { label: "Healthy", range: "80-89", color: "bg-green-400" },
              { label: "Excellent", range: "90-100", color: "bg-green-600" },
            ].map((level) => (
              <div
                key={level.label}
                className={`flex-1 text-center p-3 rounded-lg ${
                  riskLevel === level.label
                    ? `${level.color} text-white`
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <div className="text-xs font-medium">{level.label}</div>
                <div className="text-xs opacity-75">{level.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* No Assessment Notice */}
        {!usingSavedData && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-8">
            <ClipboardList className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h4 className="font-semibold text-amber-900">Showing Sample Data</h4>
            <p className="text-sm text-amber-700 mt-1">
              You haven&apos;t completed an assessment yet. The scores above are sample data.{" "}
              <Link href="/assessment" className="underline font-medium">
                Take your assessment now
              </Link>{" "}
              to see your real wellness report.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-sm text-gray-500 py-6">
          <p>
            This assessment is designed to support employee wellbeing and is not
            intended to replace clinical evaluation or provide medical diagnoses.
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
          <Link href="/dashboard/employee" className="text-indigo-600 font-medium">
            My Report
          </Link>
          <Link href="/dashboard/hr" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            HR Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
