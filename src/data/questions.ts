export interface Question {
  id: number;
  category: string;
  question: string;
  type: "likert" | "text";
  reverseScore: boolean;
  weight: number;
}

export const categories = [
  "Job Satisfaction",
  "Mental Wellbeing",
  "Burnout",
  "Workplace Culture",
  "Work-Life Balance",
  "Resilience",
] as const;

export type Category = (typeof categories)[number];

export const categoryWeights: Record<Category, number> = {
  "Mental Wellbeing": 0.25,
  Burnout: 0.2,
  "Workplace Culture": 0.2,
  "Job Satisfaction": 0.15,
  Resilience: 0.1,
  "Work-Life Balance": 0.1,
};

export const likertOptions = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export const questions: Question[] = [
  // Job Satisfaction (10 questions)
  { id: 1, category: "Job Satisfaction", question: "I enjoy my work.", type: "likert", reverseScore: false, weight: 1 },
  { id: 2, category: "Job Satisfaction", question: "I understand my responsibilities clearly.", type: "likert", reverseScore: false, weight: 1 },
  { id: 3, category: "Job Satisfaction", question: "My work feels meaningful.", type: "likert", reverseScore: false, weight: 1 },
  { id: 4, category: "Job Satisfaction", question: "I receive recognition for my efforts.", type: "likert", reverseScore: false, weight: 1 },
  { id: 5, category: "Job Satisfaction", question: "I feel motivated to do my best at work.", type: "likert", reverseScore: false, weight: 1 },
  { id: 6, category: "Job Satisfaction", question: "I am satisfied with my career growth opportunities.", type: "likert", reverseScore: false, weight: 1 },
  { id: 7, category: "Job Satisfaction", question: "I feel valued by my organization.", type: "likert", reverseScore: false, weight: 1 },
  { id: 8, category: "Job Satisfaction", question: "My skills are well-utilized in my role.", type: "likert", reverseScore: false, weight: 1 },
  { id: 9, category: "Job Satisfaction", question: "I would recommend my workplace to others.", type: "likert", reverseScore: false, weight: 1 },
  { id: 10, category: "Job Satisfaction", question: "I feel aligned with the company's mission.", type: "likert", reverseScore: false, weight: 1 },

  // Mental Wellbeing (8 questions)
  { id: 11, category: "Mental Wellbeing", question: "I feel emotionally healthy.", type: "likert", reverseScore: false, weight: 1 },
  { id: 12, category: "Mental Wellbeing", question: "I sleep well most nights.", type: "likert", reverseScore: false, weight: 1 },
  { id: 13, category: "Mental Wellbeing", question: "I feel optimistic about the future.", type: "likert", reverseScore: false, weight: 1 },
  { id: 14, category: "Mental Wellbeing", question: "I can manage stress effectively.", type: "likert", reverseScore: false, weight: 1 },
  { id: 15, category: "Mental Wellbeing", question: "I feel energetic during the day.", type: "likert", reverseScore: false, weight: 1 },
  { id: 16, category: "Mental Wellbeing", question: "I rarely feel anxious without reason.", type: "likert", reverseScore: false, weight: 1 },
  { id: 17, category: "Mental Wellbeing", question: "I feel confident in my abilities.", type: "likert", reverseScore: false, weight: 1 },
  { id: 18, category: "Mental Wellbeing", question: "I can focus on tasks without difficulty.", type: "likert", reverseScore: false, weight: 1 },

  // Burnout (8 questions - all reverse scored)
  { id: 19, category: "Burnout", question: "I feel exhausted after work.", type: "likert", reverseScore: true, weight: 1 },
  { id: 20, category: "Burnout", question: "I dread Mondays.", type: "likert", reverseScore: true, weight: 1 },
  { id: 21, category: "Burnout", question: "I have difficulty concentrating.", type: "likert", reverseScore: true, weight: 1 },
  { id: 22, category: "Burnout", question: "I feel detached from my work.", type: "likert", reverseScore: true, weight: 1 },
  { id: 23, category: "Burnout", question: "I feel overwhelmed by my workload.", type: "likert", reverseScore: true, weight: 1 },
  { id: 24, category: "Burnout", question: "I feel cynical about my job.", type: "likert", reverseScore: true, weight: 1 },
  { id: 25, category: "Burnout", question: "I lack the energy to start new projects.", type: "likert", reverseScore: true, weight: 1 },
  { id: 26, category: "Burnout", question: "I feel emotionally drained by my work.", type: "likert", reverseScore: true, weight: 1 },

  // Workplace Culture (8 questions)
  { id: 27, category: "Workplace Culture", question: "My manager supports my professional growth.", type: "likert", reverseScore: false, weight: 1 },
  { id: 28, category: "Workplace Culture", question: "My team respects my opinions.", type: "likert", reverseScore: false, weight: 1 },
  { id: 29, category: "Workplace Culture", question: "Communication in my team is transparent.", type: "likert", reverseScore: false, weight: 1 },
  { id: 30, category: "Workplace Culture", question: "I feel psychologically safe at work.", type: "likert", reverseScore: false, weight: 1 },
  { id: 31, category: "Workplace Culture", question: "Diversity and inclusion are valued here.", type: "likert", reverseScore: false, weight: 1 },
  { id: 32, category: "Workplace Culture", question: "Feedback is given constructively.", type: "likert", reverseScore: false, weight: 1 },
  { id: 33, category: "Workplace Culture", question: "Conflicts are resolved fairly.", type: "likert", reverseScore: false, weight: 1 },
  { id: 34, category: "Workplace Culture", question: "I trust my leadership team.", type: "likert", reverseScore: false, weight: 1 },

  // Work-Life Balance (6 questions)
  { id: 35, category: "Work-Life Balance", question: "I can disconnect from work after hours.", type: "likert", reverseScore: false, weight: 1 },
  { id: 36, category: "Work-Life Balance", question: "I have enough personal time.", type: "likert", reverseScore: false, weight: 1 },
  { id: 37, category: "Work-Life Balance", question: "I rarely work overtime.", type: "likert", reverseScore: false, weight: 1 },
  { id: 38, category: "Work-Life Balance", question: "My organization respects work-life boundaries.", type: "likert", reverseScore: false, weight: 1 },
  { id: 39, category: "Work-Life Balance", question: "I can take time off when needed.", type: "likert", reverseScore: false, weight: 1 },
  { id: 40, category: "Work-Life Balance", question: "My workload is manageable within work hours.", type: "likert", reverseScore: false, weight: 1 },

  // Resilience (6 questions)
  { id: 41, category: "Resilience", question: "I adapt well to change.", type: "likert", reverseScore: false, weight: 1 },
  { id: 42, category: "Resilience", question: "I recover quickly after setbacks.", type: "likert", reverseScore: false, weight: 1 },
  { id: 43, category: "Resilience", question: "I remain calm under pressure.", type: "likert", reverseScore: false, weight: 1 },
  { id: 44, category: "Resilience", question: "I can handle uncertainty effectively.", type: "likert", reverseScore: false, weight: 1 },
  { id: 45, category: "Resilience", question: "I learn from my failures.", type: "likert", reverseScore: false, weight: 1 },
  { id: 46, category: "Resilience", question: "I maintain a positive outlook during challenges.", type: "likert", reverseScore: false, weight: 1 },
];

export const openEndedQuestions = [
  { id: 47, question: "What motivates you at work?" },
  { id: 48, question: "What stresses you the most?" },
  { id: 49, question: "What would improve your workplace?" },
  { id: 50, question: "Describe how you've been feeling recently." },
];
