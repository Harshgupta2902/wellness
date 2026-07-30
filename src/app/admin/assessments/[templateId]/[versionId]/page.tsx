"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ArrowLeft,
  Plus,
  Check,
  Layers,
  MessageSquare,
  X,
  Rocket,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  createQuestion,
  publishVersion,
} from "@/actions/assessment-builder";
import { getSession } from "@/actions/auth";

interface CategoryInfo {
  id: string;
  name: string;
  weight: number;
  sort_order: number;
}

export default function AssessmentBuilderPage({
  params,
}: {
  params: Promise<{ templateId: string; versionId: string }>;
}) {
  const { versionId } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [questionsAdded, setQuestionsAdded] = useState(0);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catWeight, setCatWeight] = useState("0.20");

  // Question form
  const [showQForm, setShowQForm] = useState(false);
  const [qCategoryId, setQCategoryId] = useState("");
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("likert");
  const [qReverse, setQReverse] = useState(false);
  const [qWeight, setQWeight] = useState("1");

  useEffect(() => {
    async function load() {
      const session = await getSession();
      if (!session || session.role !== "super_admin") {
        router.push("/login");
        return;
      }
      const result = await getCategories(versionId);
      if (result.success && result.data) setCategories(result.data);
      setLoading(false);
    }
    load();
  }, [versionId, router]);

  const showMsg = (text: string, type: "success" | "error" | "info" = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const result = await createCategory(versionId, catName, parseFloat(catWeight), categories.length);
    if (result.success) {
      const refreshed = await getCategories(versionId);
      if (refreshed.success && refreshed.data) setCategories(refreshed.data);
      setCatName("");
      setCatWeight("0.20");
      setShowCatForm(false);
      showMsg("Category added", "success");
    } else {
      showMsg(result.message, "error");
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qCategoryId || !qText.trim()) return;

    const result = await createQuestion(versionId, {
      categoryId: qCategoryId,
      questionText: qText,
      questionType: qType,
      isReverseScored: qReverse,
      weight: parseFloat(qWeight),
      sortOrder: questionsAdded,
    });

    if (result.success) {
      setQText("");
      setQReverse(false);
      setQuestionsAdded((n) => n + 1);
      showMsg("Question added", "success");
    } else {
      showMsg(result.message, "error");
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    const result = await publishVersion(versionId);
    if (result.success) {
      showMsg("Published! Redirecting...", "success");
      setTimeout(() => router.push("/admin"), 1500);
    } else {
      showMsg(result.message, "error");
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Heart className="w-8 h-8 text-indigo-600 animate-pulse" fill="currentColor" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-indigo-600" fill="currentColor" />
              <span className="text-lg font-bold text-gray-900">Manovyatha</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">Assessment Builder</span>
          </div>
          <button
            onClick={handlePublish}
            disabled={publishing || categories.length === 0 || questionsAdded === 0}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Rocket className="w-4 h-4" />
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 page-enter">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Status Message */}
        {message && (
          <div className={`mb-5 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            message.type === "success" ? "bg-green-50 border border-green-100 text-green-700" :
            message.type === "error" ? "bg-red-50 border border-red-100 text-red-700" :
            "bg-indigo-50 border border-indigo-100 text-indigo-700"
          }`}>
            <Check className="w-4 h-4" />
            {message.text}
          </div>
        )}

        {/* Progress indicators */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 card-shadow">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{categories.length}</p>
                <p className="text-xs text-gray-500">Categories</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 card-shadow">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{questionsAdded}</p>
                <p className="text-xs text-gray-500">Questions Added</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <section className="bg-white rounded-2xl p-6 card-shadow border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Categories
            </h2>
            <button
              onClick={() => setShowCatForm(!showCatForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
            >
              {showCatForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {showCatForm ? "Cancel" : "Add"}
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={handleAddCategory} className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="input-field"
                    placeholder="Category name (e.g., Mental Wellbeing)"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={catWeight}
                    onChange={(e) => setCatWeight(e.target.value)}
                    className="input-field"
                    placeholder="Weight"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary !py-2 text-sm w-full">
                Add Category
              </button>
            </form>
          )}

          {categories.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Add your first category to begin.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-800 text-sm">{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {(cat.weight * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Questions */}
        <section className="bg-white rounded-2xl p-6 card-shadow border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-600" />
              Questions
            </h2>
            <button
              onClick={() => setShowQForm(!showQForm)}
              disabled={categories.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {showQForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {showQForm ? "Cancel" : "Add"}
            </button>
          </div>

          {showQForm && (
            <form onSubmit={handleAddQuestion} className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={qCategoryId}
                  onChange={(e) => setQCategoryId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="input-field"
                >
                  <option value="likert">Likert (1-5)</option>
                  <option value="stars">Stars</option>
                  <option value="numeric">Numeric</option>
                  <option value="yes_no">Yes / No</option>
                  <option value="slider">Slider</option>
                  <option value="nps">NPS</option>
                </select>
              </div>

              <input
                type="text"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="input-field"
                placeholder="Question text (e.g., I feel emotionally healthy.)"
                required
              />

              <div className="flex items-center gap-4">
                <div className="w-28">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={qWeight}
                    onChange={(e) => setQWeight(e.target.value)}
                    className="input-field"
                    placeholder="Weight"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={qReverse}
                    onChange={(e) => setQReverse(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Reverse Scored</span>
                </label>
              </div>

              <button type="submit" className="btn-primary !py-2 text-sm w-full">
                Add Question
              </button>
            </form>
          )}

          {!showQForm && categories.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6">Add categories first to start adding questions.</p>
          )}

          {!showQForm && categories.length > 0 && questionsAdded === 0 && (
            <p className="text-gray-400 text-sm text-center py-6">No questions yet. Click &quot;Add&quot; to start.</p>
          )}

          {!showQForm && questionsAdded > 0 && (
            <p className="text-green-600 text-sm text-center py-6 font-medium">
              ✓ {questionsAdded} question{questionsAdded !== 1 ? "s" : ""} added this session
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
