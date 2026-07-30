// Local Storage based persistence for assessment data

export interface SavedAssessment {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    age: string;
    department: string;
    designation: string;
    experience: string;
    workMode: string;
  };
  answers: Record<number, number>; // questionId -> likert value
  textAnswers: Record<number, string>; // questionId -> text response
  scores: {
    overallScore: number;
    riskLevel: string;
    categoryScores: {
      category: string;
      percentage: number;
    }[];
  };
  submittedAt: string;
}

const STORAGE_KEY = "manovyatha_assessments";

export function saveAssessment(assessment: SavedAssessment): void {
  if (typeof window === "undefined") return;
  const existing = getAssessments();
  existing.push(assessment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getAssessments(): SavedAssessment[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getLatestAssessment(): SavedAssessment | null {
  const all = getAssessments();
  if (all.length === 0) return null;
  return all[all.length - 1];
}

export function clearAssessments(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
