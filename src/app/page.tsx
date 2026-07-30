"use client";

import Link from "next/link";
import {
  Heart,
  Brain,
  BarChart3,
  Shield,
  Users,
  ClipboardList,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-indigo-600" fill="currentColor" />
            <span className="text-xl font-bold text-gray-900">Manovyatha</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/assessment"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Take Assessment
            </Link>
            <Link
              href="/dashboard/employee"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Employee Dashboard
            </Link>
            <Link
              href="/dashboard/hr"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              HR Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Employee Wellness & Psychological Assessment
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-10">
            AI-powered wellness insights for early identification of stress,
            burnout, and disengagement. Confidential assessments with
            personalized recommendations.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/assessment"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Start Assessment
            </Link>
            <Link
              href="/dashboard/hr"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View HR Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-14">
            A comprehensive approach to employee wellness combining
            standardized questionnaires, AI analysis, and clinical scoring.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ClipboardList className="w-8 h-8" />}
              title="Take Assessment"
              description="Complete a confidential questionnaire covering job satisfaction, mental wellbeing, burnout, culture, work-life balance, and resilience."
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Analysis"
              description="Open-ended responses are analyzed by AI to detect sentiment, identify risk flags, and generate personalized recommendations."
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Actionable Insights"
              description="Receive a detailed wellness report with scores, strengths, improvement areas, and tracked progress over time."
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
            Assessment Categories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CategoryCard
              title="Mental Wellbeing"
              weight="25%"
              description="Emotional health, sleep quality, optimism, and stress management"
              color="bg-blue-50 text-blue-700"
            />
            <CategoryCard
              title="Burnout"
              weight="20%"
              description="Exhaustion, detachment, concentration, and emotional drainage"
              color="bg-red-50 text-red-700"
            />
            <CategoryCard
              title="Workplace Culture"
              weight="20%"
              description="Manager support, team respect, transparency, and psychological safety"
              color="bg-purple-50 text-purple-700"
            />
            <CategoryCard
              title="Job Satisfaction"
              weight="15%"
              description="Enjoyment, purpose, recognition, motivation, and career growth"
              color="bg-green-50 text-green-700"
            />
            <CategoryCard
              title="Resilience"
              weight="10%"
              description="Adaptability, recovery from setbacks, and calm under pressure"
              color="bg-amber-50 text-amber-700"
            />
            <CategoryCard
              title="Work-Life Balance"
              weight="10%"
              description="Disconnect ability, personal time, overtime, and boundary respect"
              color="bg-teal-50 text-teal-700"
            />
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Privacy & Confidentiality
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Your assessment responses are strictly confidential. Individual
            results are never shared with HR or management without explicit
            consent. Only aggregated, anonymized trends are available on the HR
            dashboard.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4">
              <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                HR sees only department-level aggregates
              </p>
            </div>
            <div className="p-4">
              <Shield className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Data encrypted and securely stored
              </p>
            </div>
            <div className="p-4">
              <Heart className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Employee consent required before any sharing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-indigo-400" fill="currentColor" />
            <span className="text-white font-semibold">Manovyatha</span>
          </div>
          <p className="text-sm">
            This platform supports employee wellbeing and is not intended to
            replace clinical evaluation or provide medical diagnoses.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-8 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function CategoryCard({
  title,
  weight,
  description,
  color,
}: {
  title: string;
  weight: string;
  description: string;
  color: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
          {weight}
        </span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
