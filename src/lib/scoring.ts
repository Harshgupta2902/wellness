import { questions, categoryWeights, type Category } from "@/data/questions";

export interface CategoryScore {
  category: Category;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface AssessmentScores {
  categoryScores: CategoryScore[];
  overallScore: number;
  riskLevel: string;
}

export function calculateCategoryScore(
  answers: Record<number, number>,
  category: Category
): CategoryScore {
  const categoryQuestions = questions.filter((q) => q.category === category);
  let totalScore = 0;
  let answeredCount = 0;

  for (const q of categoryQuestions) {
    const answer = answers[q.id];
    if (answer !== undefined) {
      const adjustedScore = q.reverseScore ? 6 - answer : answer;
      totalScore += adjustedScore;
      answeredCount++;
    }
  }

  const maxScore = answeredCount * 5;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    category,
    score: totalScore,
    maxScore,
    percentage,
  };
}

export function calculateOverallScore(categoryScores: CategoryScore[]): number {
  let weightedSum = 0;

  for (const cs of categoryScores) {
    const weight = categoryWeights[cs.category] || 0;
    weightedSum += cs.percentage * weight;
  }

  return Math.round(weightedSum);
}

export function getRiskLevel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Healthy";
  if (score >= 65) return "Moderate";
  if (score >= 50) return "High Risk";
  return "Critical";
}

export function calculateFullAssessment(
  answers: Record<number, number>
): AssessmentScores {
  const allCategories: Category[] = [
    "Job Satisfaction",
    "Mental Wellbeing",
    "Burnout",
    "Workplace Culture",
    "Work-Life Balance",
    "Resilience",
  ];

  const categoryScores = allCategories.map((cat) =>
    calculateCategoryScore(answers, cat)
  );
  const overallScore = calculateOverallScore(categoryScores);
  const riskLevel = getRiskLevel(overallScore);

  return { categoryScores, overallScore, riskLevel };
}
