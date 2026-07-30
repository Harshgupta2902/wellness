"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Layers,
  MessageSquare,
  X,
  Rocket,
  Pencil,
  Trash2,
  RotateCcw,
  Save,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  getCategories,
  getQuestions,
  createCategory,
  createQuestion,
  publishVersion,
  updateQuestion,
  deleteQuestion,
  updateCategory,
  deleteCategory,
} from "@/actions/assessment-builder";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

interface CategoryInfo {
  id: string;
  name: string;
  weight: number;
  sort_order: number;
}

interface QuestionInfo {
  id: string;
  category_id: string;
  question_text: string;
  question_type: string;
  weight: number;
  is_reverse_scored: boolean;
  sort_order: number;
}

export default function AssessmentBuilderPage({
  params,
}: {
  params: Promise<{ templateId: string; versionId: string }>;
}) {
  const { versionId } = use(params);

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      {(session) => <BuilderContent versionId={versionId} email={session.email} />}
    </AuthGuard>
  );
}

function BuilderContent({ versionId, email }: { versionId: string; email: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [questions, setQuestions] = useState<QuestionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Expanded categories
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Add forms
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catWeight, setCatWeight] = useState("0.20");

  const [showQForm, setShowQForm] = useState(false);
  const [qCategoryId, setQCategoryId] = useState("");
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("likert");
  const [qReverse, setQReverse] = useState(false);

  // Edit state
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editReverse, setEditReverse] = useState(false);

  useEffect(() => {
    async function load() {
      await refresh();
      setLoading(false);
    }
    load();
  }, [versionId]);

  const refresh = async () => {
    const [catResult, qResult] = await Promise.all([
      getCategories(versionId),
      getQuestions(versionId),
    ]);
    if (catResult.success && catResult.data) setCategories(catResult.data);
    if (qResult.success && qResult.data) setQuestions(qResult.data);
  };

  const notify = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedCats(new Set(categories.map((c) => c.id)));

  // ─── Handlers ──────────────────────────────────────────

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const result = await createCategory(versionId, catName, parseFloat(catWeight), categories.length);
    if (result.success) {
      await refresh();
      setCatName("");
      setCatWeight("0.20");
      setShowCatForm(false);
      notify("Category added");
    } else notify(result.message, "error");
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its questions?")) return;
    const result = await deleteCategory(id);
    if (result.success) { await refresh(); notify("Category deleted"); }
    else notify(result.message, "error");
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qCategoryId || !qText.trim()) return;
    const result = await createQuestion(versionId, {
      categoryId: qCategoryId,
      questionText: qText,
      questionType: qType,
      isReverseScored: qReverse,
      sortOrder: questions.length,
    });
    if (result.success) {
      setQText("");
      setQReverse(false);
      await refresh();
      notify("Question added");
    } else notify(result.message, "error");
  };

  const handleEditQuestion = (q: QuestionInfo) => {
    setEditingQuestion(q.id);
    setEditText(q.question_text);
    setEditReverse(q.is_reverse_scored);
  };

  const handleSaveEdit = async (id: string) => {
    const result = await updateQuestion(id, { questionText: editText, isReverseScored: editReverse });
    if (result.success) { await refresh(); setEditingQuestion(null); notify("Question updated"); }
    else notify(result.message, "error");
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    const result = await deleteQuestion(id);
    if (result.success) { await refresh(); notify("Question deleted"); }
    else notify(result.message, "error");
  };

  const handlePublish = async () => {
    setPublishing(true);
    const result = await publishVersion(versionId);
    if (result.success) {
      notify("Published!");
      setTimeout(() => router.push("/admin"), 1000);
    } else { notify(result.message, "error"); setPublishing(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <Image src="/logo.png" alt="Loading" width={32} height={32} className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Header email={email} role="super_admin" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg animate-in ${
          toast.type === "success" ? "bg-[#022932] text-white" : "bg-red-600 text-white"
        }`}>
          {toast.text}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-6 page-enter">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-[#5b7a80] hover:text-[#022932] transition-colors mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-[#d4e0e3] card-shadow">
            <p className="text-2xl font-bold text-[#022932]">{categories.length}</p>
            <p className="text-xs text-[#5b7a80]">Categories</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#d4e0e3] card-shadow">
            <p className="text-2xl font-bold text-[#022932]">{questions.length}</p>
            <p className="text-xs text-[#5b7a80]">Questions</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#d4e0e3] card-shadow">
            <p className="text-2xl font-bold text-[#2a787c]">
              {(categories.reduce((s, c) => s + c.weight, 0) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-[#5b7a80]">Total Weight</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Categories + Questions list */}
          <div className="lg:col-span-2 space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#022932]">Categories & Questions</h2>
              <div className="flex gap-2">
                <button onClick={expandAll} className="text-xs text-[#2a787c] hover:underline">Expand All</button>
                <button onClick={() => setExpandedCats(new Set())} className="text-xs text-[#5b7a80] hover:underline">Collapse</button>
              </div>
            </div>

            {categories.length === 0 && (
              <div className="bg-white rounded-xl p-8 border border-[#d4e0e3] text-center">
                <p className="text-[#5b7a80] text-sm">No categories yet. Add one from the panel on the right.</p>
              </div>
            )}

            {categories.map((cat) => {
              const catQuestions = questions.filter((q) => q.category_id === cat.id);
              const isExpanded = expandedCats.has(cat.id);

              return (
                <div key={cat.id} className="bg-white rounded-xl border border-[#d4e0e3] overflow-hidden card-shadow">
                  {/* Category header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#f5fafa] transition-colors"
                    onClick={() => toggleCat(cat.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-[#5b7a80]" /> : <ChevronRight className="w-4 h-4 text-[#5b7a80]" />}
                      <span className="font-semibold text-[#022932] text-sm">{cat.name}</span>
                      <span className="text-xs text-[#5b7a80] bg-[#f0f7f8] px-2 py-0.5 rounded-full">{catQuestions.length} questions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#2a787c]">{(cat.weight * 100).toFixed(0)}%</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                        className="text-[#8ba5aa] hover:text-red-500 transition-colors p-1"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Questions list */}
                  {isExpanded && (
                    <div className="border-t border-[#d4e0e3]">
                      {catQuestions.length === 0 ? (
                        <p className="text-xs text-[#8ba5aa] text-center py-4">No questions in this category</p>
                      ) : (
                        <div className="divide-y divide-[#f0f7f8]">
                          {catQuestions.map((q, idx) => (
                            <div key={q.id} className="px-4 py-2.5 hover:bg-[#fafcfc] group">
                              {editingQuestion === q.id ? (
                                /* Edit mode */
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="input-field text-sm"
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-1.5 text-xs text-[#5b7a80] cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={editReverse}
                                        onChange={(e) => setEditReverse(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#2a787c]"
                                      />
                                      Reverse scored
                                    </label>
                                    <div className="flex-1" />
                                    <button onClick={() => setEditingQuestion(null)} className="text-xs text-[#5b7a80] hover:text-[#022932]">Cancel</button>
                                    <button onClick={() => handleSaveEdit(q.id)} className="text-xs font-semibold text-[#2a787c] hover:text-[#022932] flex items-center gap-1">
                                      <Save className="w-3 h-3" /> Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* View mode */
                                <div className="flex items-start gap-3">
                                  <span className="text-[10px] text-[#8ba5aa] font-mono w-5 text-right flex-shrink-0 mt-0.5">{idx + 1}</span>
                                  <p className="text-sm text-[#022932] flex-1 leading-relaxed">{q.question_text}</p>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    {q.is_reverse_scored && (
                                      <span className="text-[9px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded mr-1">R</span>
                                    )}
                                    <button onClick={() => handleEditQuestion(q)} className="p-1 text-[#8ba5aa] hover:text-[#2a787c]" title="Edit">
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 text-[#8ba5aa] hover:text-red-500" title="Delete">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Add forms */}
          <div className="space-y-4">
            {/* Add Category */}
            <div className="bg-white rounded-xl p-5 border border-[#d4e0e3] card-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#022932] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2a787c]" />
                  Add Category
                </h3>
              </div>
              <form onSubmit={handleAddCategory} className="space-y-3">
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="input-field text-sm"
                  placeholder="Category name"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={catWeight}
                    onChange={(e) => setCatWeight(e.target.value)}
                    className="input-field text-sm w-24"
                    placeholder="Weight"
                  />
                  <button type="submit" className="btn-primary !py-2 text-xs flex-1">
                    <Plus className="w-3 h-3 inline mr-1" />Add
                  </button>
                </div>
              </form>
            </div>

            {/* Add Question */}
            <div className="bg-white rounded-xl p-5 border border-[#d4e0e3] card-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#022932] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2a787c]" />
                  Add Question
                </h3>
              </div>
              <form onSubmit={handleAddQuestion} className="space-y-3">
                <select
                  value={qCategoryId}
                  onChange={(e) => setQCategoryId(e.target.value)}
                  className="input-field text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="input-field text-sm !h-auto resize-none"
                  rows={2}
                  placeholder="Question text..."
                  required
                />
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="likert">Likert (1-5)</option>
                  <option value="stars">Stars</option>
                  <option value="numeric">Numeric</option>
                  <option value="yes_no">Yes / No</option>
                  <option value="slider">Slider</option>
                  <option value="nps">NPS</option>
                </select>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qReverse}
                    onChange={(e) => setQReverse(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#2a787c]"
                  />
                  <span className="text-xs text-[#5b7a80]">Reverse scored</span>
                </label>
                <button type="submit" disabled={!qCategoryId || !qText.trim()} className="btn-accent !py-2 text-xs w-full">
                  <Plus className="w-3 h-3 inline mr-1" />Add Question
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
