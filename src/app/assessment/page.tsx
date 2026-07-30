"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getActiveAssessment, submitAssessment } from "@/actions/assessments";
import { getSession } from "@/actions/auth";

type Step = "login-check" | "questions" | "results";

interface CategoryData {
  id: string;
  name: string;
  weight: number;
  sort_order: number;
}

interface QuestionData {
  id: string;
  category_id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  is_reverse_scored: boolean;
  sort_order: number;
  question_options: { id: string; label: string; value: number; sort_order: number }[];
}

interface ResultData {
  overallScore: number;
  riskLevel: string;
  categoryScores: { category: string; percentage: number }[];
}

export default function AssessmentPage() {
  const [step, setStep] = useState<Step>("login-check");
  const [versionId, setVersionId] = useState<string>("");
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const session = await getSession();
      if (!session || session.role !== "employee") {
        setError("Please login as an employee to take the assessment.");
        setStep("login-check");
        return;
      }

      const result = await getActiveAssessment();
      if (!result.success || !result.data) {
        setError(result.message || "No active assessment available.");
        return;
      }

      setVersionId(result.data.versionId);
      setCategories(result.data.categories);
      setQuestions(result.data.questions);
      setStep("questions");
    }
    load();
  }, []);

  const currentCatId = categories[currentCategory]?.id;
  const categoryQuestions = questions.filter((q) => q.category_id === currentCatId);
  const allCategoryAnswered = categoryQuestions.every((q) => answers[q.id] !== undefined);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentCategory > 0) setCurrentCategory((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const answerList = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    const result = await submitAssessment({ versionId, answers: answerList });

    if (result.success && result.data) {
      setResults(result.data);
      setStep("results");
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  const progress = step === "questions"
    ? ((currentCategory + 1) / categories.length) * 90
    : step === "results" ? 100 : 5;

  // Login check / error state
  if (error && step === "login-check") {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Header />
        <main className="max-w-lg mx-auto px-6 py-20 text-center page-enter">
          <AlertCircle className="w-12 h-12 text-[#2a787c] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#022932] mb-2">Access Required</h2>
          <p className="text-[#5b7a80] mb-6">{error}</p>
          <Link href="/login" className="btn-primary inline-flex items-center gap-2">
            Sign In <ChevronRight className="w-4 h-4" />
          </Link>
        </main>
      </div>
    );
  }

  if (step === "login-check") {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Header />
        <main className="max-w-lg mx-auto px-6 py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#2a787c] animate-spin mx-auto mb-4" />
          <p className="text-[#5b7a80]">Loading assessment...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Header />

      {/* Progress Bar */}
      <div className="w-full bg-[#d4e0e3] h-1">
        <div className="bg-[#2a787c] h-1 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10 page-enter">
        {/* Questions Step */}
        {step === "questions" && (
          <div className="bg-white rounded-2xl p-8 card-shadow border border-[#d4e0e3]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#022932]">{categories[currentCategory]?.name}</h2>
                <p className="text-sm text-[#5b7a80]">
                  Category {currentCategory + 1} of {categories.length}
                </p>
              </div>
              <span className="text-sm font-medium text-[#2a787c] bg-[#2a787c]/10 px-3 py-1 rounded-full">
                {Object.keys(answers).length} / {questions.length}
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {categoryQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl border border-[#d4e0e3] hover:border-[#2a787c]/30 transition-colors">
                  <p className="text-[#022932] font-medium mb-3">
                    {idx + 1}. {q.question_text}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.question_options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer(q.id, option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          answers[q.id] === option.value
                            ? "bg-[#022932] text-white"
                            : "bg-[#f0f7f8] text-[#5b7a80] hover:bg-[#d4e0e3]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrev}
                disabled={currentCategory === 0}
                className="btn-secondary flex items-center gap-2 !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!allCategoryAnswered || submitting}
                className="btn-primary flex items-center gap-2 !py-2.5"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentCategory < categories.length - 1 ? (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <>Submit Assessment <CheckCircle2 className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Step */}
        {step === "results" && results && (
          <div className="space-y-6 page-enter">
            <div className="bg-white rounded-2xl p-8 card-shadow border border-[#d4e0e3] text-center">
              <CheckCircle2 className="w-16 h-16 text-[#2a787c] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#022932] mb-2">Assessment Complete!</h2>
              <p className="text-[#5b7a80] mb-8">Here are your wellness scores.</p>

              <div className="inline-flex flex-col items-center">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white ${getScoreBg(results.overallScore)}`}>
                  {results.overallScore}
                </div>
                <span className="mt-3 text-lg font-semibold text-[#022932]">Overall Score</span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full mt-1 ${getRiskBadge(results.riskLevel)}`}>
                  {formatRiskLevel(results.riskLevel)}
                </span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl p-8 card-shadow border border-[#d4e0e3]">
              <h3 className="text-lg font-bold text-[#022932] mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                {results.categoryScores.map((cs) => (
                  <div key={cs.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[#022932]">{cs.category}</span>
                      <span className="font-semibold text-[#2a787c]">{cs.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#d4e0e3] rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getScoreBar(cs.percentage)}`}
                        style={{ width: `${cs.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/dashboard/employee" className="btn-primary flex-1 text-center">
                View Full Report
              </Link>
              <Link href="/" className="btn-secondary flex-1 text-center">
                Back to Home
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
        <span className="text-sm text-[#5b7a80]">Wellness Assessment</span>
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

function getScoreBar(score: number): string {
  if (score >= 80) return "bg-[#2a787c]";
  if (score >= 65) return "bg-[#d97706]";
  if (score >= 50) return "bg-[#ea580c]";
  return "bg-[#dc2626]";
}

function getRiskBadge(risk: string): string {
  switch (risk) {
    case "excellent":
    case "healthy":
      return "bg-[#2a787c]/10 text-[#2a787c]";
    case "moderate":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

function formatRiskLevel(risk: string): string {
  return risk.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
