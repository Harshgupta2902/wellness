"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft, Sparkles } from "lucide-react";
import { createTemplate } from "@/actions/assessment-builder";

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const result = await createTemplate(name, description);

    if (result.success && result.data) {
      router.push(`/admin/assessments/${result.data.templateId}/${result.data.versionId}`);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <Heart className="w-7 h-7 text-indigo-600" fill="currentColor" />
            <span className="text-lg font-bold text-gray-900">Manovyatha</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">New Template</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10 page-enter">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl p-8 card-shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">New Assessment Template</h1>
              <p className="text-xs text-gray-500">You&apos;ll add categories and questions next</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Template Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="e.g., Monthly Wellness Check"
                required
              />
            </div>

            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field !h-auto resize-none"
                rows={3}
                placeholder="Brief description of this assessment..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
            >
              {loading ? "Creating..." : "Create & Start Building →"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
