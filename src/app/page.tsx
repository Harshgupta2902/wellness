"use client";

import Link from "next/link";
import {
  Heart,
  Brain,
  BarChart3,
  Shield,
  Users,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-indigo-600" fill="currentColor" />
            <span className="text-xl font-bold text-gray-900">Manovyatha</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/assessment"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm"
            >
              Take Assessment
            </Link>
            <Link
              href="/dashboard/employee"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm"
            >
              My Dashboard
            </Link>
            <Link
              href="/login"
              className="btn-primary text-sm !py-2 !px-5"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-bg-subtle" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Employee Wellness
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Employee Wellness &{" "}
              <span className="gradient-text">Psychological</span>{" "}
              Assessment
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Identify stress, burnout, and disengagement early with AI-powered
              wellness insights. Confidential assessments with personalized
              recommendations for every employee.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/assessment"
                className="btn-primary inline-flex items-center justify-center gap-2 text-base"
              >
                Start Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/hr"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-base"
              >
                View HR Dashboard
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Assessment Categories", value: "6" },
              { label: "Questions", value: "46+" },
              { label: "AI Analysis", value: "Real-time" },
              { label: "Confidential", value: "100%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-white/60 border border-white card-shadow">
                <p className="text-2xl font-bold text-indigo-600">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A comprehensive approach combining standardized questionnaires,
              AI analysis, and clinical scoring.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              step="01"
              icon={<ClipboardList className="w-6 h-6" />}
              title="Take Assessment"
              description="Complete a confidential questionnaire covering job satisfaction, mental wellbeing, burnout, culture, work-life balance, and resilience."
              color="from-blue-500 to-indigo-600"
            />
            <FeatureCard
              step="02"
              icon={<Brain className="w-6 h-6" />}
              title="AI Analysis"
              description="Responses are analyzed by AI to detect sentiment, identify risk flags, and generate personalized recommendations."
              color="from-violet-500 to-purple-600"
            />
            <FeatureCard
              step="03"
              icon={<BarChart3 className="w-6 h-6" />}
              title="Actionable Insights"
              description="Receive a detailed wellness report with scores, strengths, improvement areas, and tracked progress over time."
              color="from-emerald-500 to-green-600"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 pattern-dots bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Assessment Categories
            </h2>
            <p className="text-gray-600">
              Six dimensions of wellness, scientifically weighted for accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CategoryCard
              title="Mental Wellbeing"
              weight="25%"
              description="Emotional health, sleep quality, optimism, and stress management"
              icon="🧠"
              gradient="from-blue-50 to-indigo-50"
              border="border-blue-100"
            />
            <CategoryCard
              title="Burnout"
              weight="20%"
              description="Exhaustion, detachment, concentration, and emotional drainage"
              icon="🔥"
              gradient="from-red-50 to-orange-50"
              border="border-red-100"
            />
            <CategoryCard
              title="Workplace Culture"
              weight="20%"
              description="Manager support, team respect, transparency, and psychological safety"
              icon="🤝"
              gradient="from-purple-50 to-pink-50"
              border="border-purple-100"
            />
            <CategoryCard
              title="Job Satisfaction"
              weight="15%"
              description="Enjoyment, purpose, recognition, motivation, and career growth"
              icon="⭐"
              gradient="from-green-50 to-emerald-50"
              border="border-green-100"
            />
            <CategoryCard
              title="Resilience"
              weight="10%"
              description="Adaptability, recovery from setbacks, and calm under pressure"
              icon="💪"
              gradient="from-amber-50 to-yellow-50"
              border="border-amber-100"
            />
            <CategoryCard
              title="Work-Life Balance"
              weight="10%"
              description="Disconnect ability, personal time, overtime, and boundary respect"
              icon="⚖️"
              gradient="from-teal-50 to-cyan-50"
              border="border-teal-100"
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-10 md:p-16 border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl" />

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                <Shield className="w-8 h-8" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Privacy & Confidentiality
              </h2>
              <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                Your assessment responses are strictly confidential. Individual
                results are never shared without explicit consent.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <TrustCard
                  icon={<Users className="w-5 h-5" />}
                  title="Anonymized Data"
                  description="HR sees only department-level aggregates"
                />
                <TrustCard
                  icon={<Lock className="w-5 h-5" />}
                  title="AES-256 Encrypted"
                  description="All personal data encrypted at rest"
                />
                <TrustCard
                  icon={<Zap className="w-5 h-5" />}
                  title="Consent Required"
                  description="Explicit consent before any data sharing"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to prioritize your wellbeing?
          </h2>
          <p className="text-gray-600 mb-8">
            Take a 10-minute confidential assessment and get personalized insights.
          </p>
          <Link
            href="/assessment"
            className="btn-primary inline-flex items-center gap-2 text-base"
          >
            Start Your Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-indigo-400" fill="currentColor" />
              <span className="text-white font-semibold">Manovyatha</span>
            </div>
            <p className="text-sm text-center md:text-left">
              Supporting employee wellbeing. Not intended to replace clinical evaluation.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/assessment" className="hover:text-white transition-colors">Assessment</Link>
              <Link href="/setup" className="hover:text-white transition-colors">Setup</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  step,
  icon,
  title,
  description,
  color,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="relative p-8 rounded-2xl bg-white border border-gray-100 card-shadow group">
      <div className="absolute top-6 right-6 text-4xl font-bold text-gray-100 group-hover:text-indigo-50 transition-colors">
        {step}
      </div>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} text-white mb-5`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function CategoryCard({
  title,
  weight,
  description,
  icon,
  gradient,
  border,
}: {
  title: string;
  weight: string;
  description: string;
  icon: string;
  gradient: string;
  border: string;
}) {
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} border ${border} card-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">
          {weight}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-white border border-gray-100 card-shadow text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 mb-3">
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
