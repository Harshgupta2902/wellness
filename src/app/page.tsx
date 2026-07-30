"use client";

import Link from "next/link";
import Image from "next/image";
import {
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
            <Image src="/logo.png" alt="Manovyatha" width={36} height={36} />
            <span className="text-xl font-bold text-[#022932]">Manovyatha</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/assessment" className="text-[#5b7a80] hover:text-[#022932] font-medium transition-colors text-sm">
              Take Assessment
            </Link>
            <Link href="/dashboard/employee" className="text-[#5b7a80] hover:text-[#022932] font-medium transition-colors text-sm">
              My Dashboard
            </Link>
            <Link href="/login" className="btn-primary text-sm !py-2 !px-5">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 gradient-bg-subtle" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#2a787c]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#022932]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2a787c]/10 border border-[#2a787c]/20 text-[#2a787c] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Employee Wellness
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-[#022932] mb-6 leading-tight">
              Employee Wellness &{" "}
              <span className="gradient-text">Psychological</span>{" "}
              Assessment
            </h1>

            <p className="text-lg text-[#5b7a80] max-w-2xl mx-auto mb-10 leading-relaxed">
              Identify stress, burnout, and disengagement early with AI-powered
              wellness insights. Confidential assessments with personalized
              recommendations for every employee.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment" className="btn-primary inline-flex items-center justify-center gap-2 text-base">
                Start Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard/hr" className="btn-secondary inline-flex items-center justify-center gap-2 text-base">
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
              <div key={stat.label} className="text-center p-4 rounded-xl bg-white/80 border border-[#d4e0e3] card-shadow">
                <p className="text-2xl font-bold text-[#022932]">{stat.value}</p>
                <p className="text-xs text-[#5b7a80] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#022932] mb-4">
              How It Works
            </h2>
            <p className="text-[#5b7a80] max-w-2xl mx-auto">
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
            />
            <FeatureCard
              step="02"
              icon={<Brain className="w-6 h-6" />}
              title="AI Analysis"
              description="Responses are analyzed by AI to detect sentiment, identify risk flags, and generate personalized recommendations."
            />
            <FeatureCard
              step="03"
              icon={<BarChart3 className="w-6 h-6" />}
              title="Actionable Insights"
              description="Receive a detailed wellness report with scores, strengths, improvement areas, and tracked progress over time."
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 pattern-dots bg-[#f5fafa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#022932] mb-4">
              Assessment Categories
            </h2>
            <p className="text-[#5b7a80]">
              Six dimensions of wellness, scientifically weighted for accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CategoryCard title="Mental Wellbeing" weight="25%" description="Emotional health, sleep quality, optimism, and stress management" icon="🧠" />
            <CategoryCard title="Burnout" weight="20%" description="Exhaustion, detachment, concentration, and emotional drainage" icon="🔥" />
            <CategoryCard title="Workplace Culture" weight="20%" description="Manager support, team respect, transparency, and psychological safety" icon="🤝" />
            <CategoryCard title="Job Satisfaction" weight="15%" description="Enjoyment, purpose, recognition, motivation, and career growth" icon="⭐" />
            <CategoryCard title="Resilience" weight="10%" description="Adaptability, recovery from setbacks, and calm under pressure" icon="💪" />
            <CategoryCard title="Work-Life Balance" weight="10%" description="Disconnect ability, personal time, overtime, and boundary respect" icon="⚖️" />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#f0f7f8] via-white to-[#e8f4f5] rounded-3xl p-10 md:p-16 border border-[#d4e0e3] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2a787c]/5 rounded-full blur-3xl" />

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2a787c]/10 text-[#2a787c] mb-6">
                <Shield className="w-8 h-8" />
              </div>

              <h2 className="text-3xl font-bold text-[#022932] mb-4">
                Privacy & Confidentiality
              </h2>
              <p className="text-[#5b7a80] text-lg mb-10 max-w-2xl mx-auto">
                Your assessment responses are strictly confidential. Individual
                results are never shared without explicit consent.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <TrustCard icon={<Users className="w-5 h-5" />} title="Anonymized Data" description="HR sees only department-level aggregates" />
                <TrustCard icon={<Lock className="w-5 h-5" />} title="AES-256 Encrypted" description="All personal data encrypted at rest" />
                <TrustCard icon={<Zap className="w-5 h-5" />} title="Consent Required" description="Explicit consent before any data sharing" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to prioritize your wellbeing?
          </h2>
          <p className="text-[#b8ced2] mb-8">
            Take a 10-minute confidential assessment and get personalized insights.
          </p>
          <Link href="/assessment" className="inline-flex items-center gap-2 text-base bg-white text-[#022932] font-semibold px-8 py-3 rounded-xl hover:bg-[#f0f7f8] transition-colors shadow-lg">
            Start Your Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#022932] text-[#8ba5aa] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Manovyatha" width={20} height={20} />
              <span className="text-white font-semibold">Manovyatha</span>
            </div>
            <p className="text-sm text-center md:text-left">
              Supporting employee wellbeing. Not intended to replace clinical evaluation.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/assessment" className="hover:text-white transition-colors">Assessment</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ step, icon, title, description }: { step: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative p-8 rounded-2xl bg-white border border-[#d4e0e3] card-shadow group">
      <div className="absolute top-6 right-6 text-4xl font-bold text-[#d4e0e3] group-hover:text-[#2a787c]/20 transition-colors">
        {step}
      </div>
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#022932] text-white mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#022932] mb-2">{title}</h3>
      <p className="text-[#5b7a80] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function CategoryCard({ title, weight, description, icon }: { title: string; weight: string; description: string; icon: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-[#d4e0e3] card-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-bold text-[#022932]">{title}</h3>
        </div>
        <span className="text-xs font-bold text-[#2a787c] bg-[#2a787c]/10 px-2.5 py-1 rounded-full">
          {weight}
        </span>
      </div>
      <p className="text-sm text-[#5b7a80] leading-relaxed">{description}</p>
    </div>
  );
}

function TrustCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-5 rounded-xl bg-white border border-[#d4e0e3] card-shadow text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#2a787c]/10 text-[#2a787c] mb-3">
        {icon}
      </div>
      <h4 className="font-semibold text-[#022932] text-sm mb-1">{title}</h4>
      <p className="text-xs text-[#5b7a80]">{description}</p>
    </div>
  );
}
