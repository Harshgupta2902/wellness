"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  questions,
  openEndedQuestions,
  likertOptions,
  categories,
} from "@/data/questions";
import { calculateFullAssessment } from "@/lib/scoring";
import { saveAssessment } from "@/lib/storage";

type Step = "info" | "questions" | "openended" | "results";

interface PersonalInfo {
  name: string;
  email: string;
  age: string;
  department: string;
  designation: string;
  experience: string;
  workMode: string;
}

export default function AssessmentPage() {
  const [step, setStep] = useState<Step>("info");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    age: "",
    department: "",
    designation: "",
    experience: "",
    workMode: "",
  });
  const [currentCategory, setCurrentCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<ReturnType<
    typeof calculateFullAssessment
  > | null>(null);

  const currentCategoryName = categories[currentCategory];
  const categoryQuestions = questions.filter(
    (q) => q.category === currentCategoryName
  );

  const handleLikertAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleTextAnswer = (questionId: number, value: string) => {
    setTextAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const allCategoryAnswered = categoryQuestions.every(
    (q) => answers[q.id] !== undefined
  );

  const handleNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory((prev) => prev + 1);
    } else {
      setStep("openended");
    }
  };

  const handlePrev = () => {
    if (currentCategory > 0) {
      setCurrentCategory((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const result = calculateFullAssessment(answers);
    setResults(result);

    // Save to localStorage
    saveAssessment({
      id: `asr-${Date.now()}`,
      personalInfo,
      answers,
      textAnswers,
      scores: {
        overallScore: result.overallScore,
        riskLevel: result.riskLevel,
        categoryScores: result.categoryScores.map((cs) => ({
          category: cs.category,
          percentage: cs.percentage,
        })),
      },
      submittedAt: new Date().toISOString(),
    });

    setStep("results");
  };

  const handleStartAssessment = () => {
    if (
      personalInfo.name &&
      personalInfo.email &&
      personalInfo.department
    ) {
      setStep("questions");
    }
  };

  const progress =
    step === "questions"
      ? ((currentCategory + 1) / categories.length) * 80
      : step === "openended"
      ? 90
      : step === "results"
      ? 100
      : 5;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-indigo-600" fill="currentColor" />
            <span className="text-xl font-bold text-gray-900">WellPulse</span>
          </Link>
          <span className="text-sm text-gray-500">Wellness Assessment</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-indigo-600 h-1 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Personal Info Step */}
        {step === "info" && (
          <div className="bg-white rounded-2xl p-8 card-shadow">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Personal Information
            </h1>
            <p className="text-gray-600 mb-8">
              This information helps us provide personalized insights. All data
              is kept confidential.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={personalInfo.age}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, age: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  value={personalInfo.department}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      department: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={personalInfo.designation}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      designation: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Your job title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (years)
                </label>
                <input
                  type="number"
                  value={personalInfo.experience}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      experience: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Years of experience"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Mode
                </label>
                <div className="flex gap-4">
                  {["Remote", "Hybrid", "On-site"].map((mode) => (
                    <label
                      key={mode}
                      className={`flex-1 text-center py-2.5 px-4 rounded-lg border cursor-pointer transition-all ${
                        personalInfo.workMode === mode
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="workMode"
                        value={mode}
                        checked={personalInfo.workMode === mode}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            workMode: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartAssessment}
              disabled={
                !personalInfo.name ||
                !personalInfo.email ||
                !personalInfo.department
              }
              className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Start Assessment
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Questions Step */}
        {step === "questions" && (
          <div className="bg-white rounded-2xl p-8 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {currentCategoryName}
                </h2>
                <p className="text-sm text-gray-500">
                  Category {currentCategory + 1} of {categories.length}
                </p>
              </div>
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {Object.keys(answers).length} / {questions.length} answered
              </span>
            </div>

            <div className="space-y-6">
              {categoryQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors"
                >
                  <p className="text-gray-800 font-medium mb-3">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {likertOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleLikertAnswer(q.id, option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          answers[q.id] === option.value
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!allCategoryAnswered}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {currentCategory < categories.length - 1
                  ? "Next Category"
                  : "Open-ended Questions"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Open-ended Questions Step */}
        {step === "openended" && (
          <div className="bg-white rounded-2xl p-8 card-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Open-ended Questions
            </h2>
            <p className="text-gray-600 mb-6">
              Share your thoughts in your own words. These responses are
              analyzed by AI for deeper insights.
            </p>

            <div className="space-y-6">
              {openEndedQuestions.map((q) => (
                <div key={q.id}>
                  <label className="block text-gray-800 font-medium mb-2">
                    {q.question}
                  </label>
                  <textarea
                    value={textAnswers[q.id] || ""}
                    onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    rows={3}
                    placeholder="Type your answer here..."
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => {
                  setStep("questions");
                  setCurrentCategory(categories.length - 1);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Assessment
              </button>
            </div>
          </div>
        )}

        {/* Results Step */}
        {step === "results" && results && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 card-shadow text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Assessment Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Here are your wellness scores. Visit the Employee Dashboard for
                detailed insights.
              </p>

              {/* Overall Score */}
              <div className="inline-flex flex-col items-center mb-8">
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white ${
                    results.overallScore >= 80
                      ? "bg-green-500"
                      : results.overallScore >= 65
                      ? "bg-amber-500"
                      : results.overallScore >= 50
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                >
                  {results.overallScore}
                </div>
                <span className="mt-2 text-lg font-semibold text-gray-700">
                  Overall Score
                </span>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full mt-1 ${
                    results.riskLevel === "Excellent" ||
                    results.riskLevel === "Healthy"
                      ? "bg-green-100 text-green-700"
                      : results.riskLevel === "Moderate"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {results.riskLevel}
                </span>
              </div>
            </div>

            {/* Category Scores */}
            <div className="bg-white rounded-2xl p-8 card-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Category Breakdown
              </h3>
              <div className="space-y-4">
                {results.categoryScores.map((cs) => (
                  <div key={cs.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {cs.category}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {cs.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          cs.percentage >= 80
                            ? "bg-green-500"
                            : cs.percentage >= 65
                            ? "bg-amber-500"
                            : cs.percentage >= 50
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${cs.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Alert */}
            {(results.riskLevel === "High Risk" ||
              results.riskLevel === "Critical") && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800">
                    Attention Required
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Your scores indicate elevated stress or burnout risk. We
                    recommend speaking with a wellness professional or your HR
                    team for support.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Link
                href="/dashboard/employee"
                className="flex-1 text-center bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                View Full Report
              </Link>
              <Link
                href="/"
                className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
