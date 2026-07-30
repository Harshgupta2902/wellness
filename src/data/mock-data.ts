// Static mock data for the Employee Wellness Platform

export interface Employee {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  companyId: string;
  department: string;
  designation: string;
  experience: number;
  workMode: "Remote" | "Hybrid" | "On-site";
  createdAt: string;
}

export interface Company {
  id: string;
  companyName: string;
  industry: string;
  employeeCount: number;
  country: string;
  createdAt: string;
}

export interface AssessmentResult {
  id: string;
  employeeId: string;
  assessmentDate: string;
  overallScore: number;
  mentalScore: number;
  burnoutScore: number;
  cultureScore: number;
  engagementScore: number;
  resilienceScore: number;
  worklifeScore: number;
  riskLevel: "Excellent" | "Healthy" | "Moderate" | "High Risk" | "Critical";
  aiSentiment: number;
}

export interface AIAnalysis {
  stressScore: number;
  burnoutRisk: "Low" | "Moderate" | "High" | "Critical";
  overallSentiment: number;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  riskFlags: string[];
  managerRelationship: string;
  cultureFeedback: string;
}

export const company: Company = {
  id: "comp-001",
  companyName: "TechVista Solutions",
  industry: "Technology",
  employeeCount: 250,
  country: "India",
  createdAt: "2024-01-15",
};

export const employees: Employee[] = [
  { id: "emp-001", name: "Arjun Mehta", email: "arjun@techvista.com", age: 28, gender: "Male", companyId: "comp-001", department: "Engineering", designation: "Senior Developer", experience: 5, workMode: "Hybrid", createdAt: "2024-02-01" },
  { id: "emp-002", name: "Priya Sharma", email: "priya@techvista.com", age: 32, gender: "Female", companyId: "comp-001", department: "Engineering", designation: "Tech Lead", experience: 8, workMode: "Remote", createdAt: "2024-01-20" },
  { id: "emp-003", name: "Rahul Singh", email: "rahul@techvista.com", age: 26, gender: "Male", companyId: "comp-001", department: "Design", designation: "UI/UX Designer", experience: 3, workMode: "On-site", createdAt: "2024-03-05" },
  { id: "emp-004", name: "Neha Patel", email: "neha@techvista.com", age: 30, gender: "Female", companyId: "comp-001", department: "Marketing", designation: "Marketing Manager", experience: 6, workMode: "Hybrid", createdAt: "2024-01-28" },
  { id: "emp-005", name: "Vikram Joshi", email: "vikram@techvista.com", age: 35, gender: "Male", companyId: "comp-001", department: "Engineering", designation: "Engineering Manager", experience: 12, workMode: "Hybrid", createdAt: "2024-02-10" },
  { id: "emp-006", name: "Ananya Gupta", email: "ananya@techvista.com", age: 24, gender: "Female", companyId: "comp-001", department: "HR", designation: "HR Executive", experience: 2, workMode: "On-site", createdAt: "2024-04-01" },
  { id: "emp-007", name: "Karthik Nair", email: "karthik@techvista.com", age: 29, gender: "Male", companyId: "comp-001", department: "Engineering", designation: "Backend Developer", experience: 4, workMode: "Remote", createdAt: "2024-02-15" },
  { id: "emp-008", name: "Sneha Reddy", email: "sneha@techvista.com", age: 27, gender: "Female", companyId: "comp-001", department: "Design", designation: "Product Designer", experience: 4, workMode: "Hybrid", createdAt: "2024-03-12" },
  { id: "emp-009", name: "Amit Kumar", email: "amit@techvista.com", age: 33, gender: "Male", companyId: "comp-001", department: "Sales", designation: "Sales Lead", experience: 9, workMode: "On-site", createdAt: "2024-01-25" },
  { id: "emp-010", name: "Divya Iyer", email: "divya@techvista.com", age: 31, gender: "Female", companyId: "comp-001", department: "Engineering", designation: "Frontend Developer", experience: 7, workMode: "Remote", createdAt: "2024-02-20" },
];

export const assessmentResults: AssessmentResult[] = [
  { id: "asr-001", employeeId: "emp-001", assessmentDate: "2024-07-15", overallScore: 78, mentalScore: 82, burnoutScore: 72, cultureScore: 85, engagementScore: 76, resilienceScore: 80, worklifeScore: 70, riskLevel: "Moderate", aiSentiment: 72 },
  { id: "asr-002", employeeId: "emp-002", assessmentDate: "2024-07-14", overallScore: 85, mentalScore: 88, burnoutScore: 82, cultureScore: 90, engagementScore: 84, resilienceScore: 86, worklifeScore: 78, riskLevel: "Healthy", aiSentiment: 82 },
  { id: "asr-003", employeeId: "emp-003", assessmentDate: "2024-07-16", overallScore: 62, mentalScore: 58, burnoutScore: 55, cultureScore: 70, engagementScore: 65, resilienceScore: 60, worklifeScore: 68, riskLevel: "High Risk", aiSentiment: 55 },
  { id: "asr-004", employeeId: "emp-004", assessmentDate: "2024-07-13", overallScore: 91, mentalScore: 92, burnoutScore: 88, cultureScore: 94, engagementScore: 90, resilienceScore: 89, worklifeScore: 92, riskLevel: "Excellent", aiSentiment: 90 },
  { id: "asr-005", employeeId: "emp-005", assessmentDate: "2024-07-12", overallScore: 55, mentalScore: 50, burnoutScore: 45, cultureScore: 62, engagementScore: 58, resilienceScore: 55, worklifeScore: 52, riskLevel: "High Risk", aiSentiment: 48 },
  { id: "asr-006", employeeId: "emp-006", assessmentDate: "2024-07-15", overallScore: 88, mentalScore: 90, burnoutScore: 85, cultureScore: 92, engagementScore: 87, resilienceScore: 84, worklifeScore: 88, riskLevel: "Healthy", aiSentiment: 86 },
  { id: "asr-007", employeeId: "emp-007", assessmentDate: "2024-07-14", overallScore: 42, mentalScore: 38, burnoutScore: 35, cultureScore: 48, engagementScore: 45, resilienceScore: 40, worklifeScore: 50, riskLevel: "Critical", aiSentiment: 35 },
  { id: "asr-008", employeeId: "emp-008", assessmentDate: "2024-07-16", overallScore: 74, mentalScore: 76, burnoutScore: 70, cultureScore: 78, engagementScore: 72, resilienceScore: 75, worklifeScore: 73, riskLevel: "Moderate", aiSentiment: 70 },
  { id: "asr-009", employeeId: "emp-009", assessmentDate: "2024-07-11", overallScore: 68, mentalScore: 65, burnoutScore: 60, cultureScore: 72, engagementScore: 70, resilienceScore: 68, worklifeScore: 66, riskLevel: "Moderate", aiSentiment: 62 },
  { id: "asr-010", employeeId: "emp-010", assessmentDate: "2024-07-15", overallScore: 82, mentalScore: 84, burnoutScore: 80, cultureScore: 86, engagementScore: 80, resilienceScore: 82, worklifeScore: 76, riskLevel: "Healthy", aiSentiment: 78 },
];

export const aiAnalyses: Record<string, AIAnalysis> = {
  "emp-001": {
    stressScore: 65,
    burnoutRisk: "Moderate",
    overallSentiment: 72,
    strengths: ["Problem Solving", "Team Collaboration", "Technical Skills"],
    concerns: ["Work-life balance", "Occasional sleep issues", "Overtime pressure"],
    recommendations: ["Set clear work boundaries", "Practice mindfulness", "Discuss workload with manager"],
    riskFlags: ["Moderate Stress"],
    managerRelationship: "Positive - feels supported",
    cultureFeedback: "Generally satisfied with team dynamics",
  },
  "emp-002": {
    stressScore: 35,
    burnoutRisk: "Low",
    overallSentiment: 82,
    strengths: ["Leadership", "Communication", "Mentoring", "Strategic Thinking"],
    concerns: ["Remote isolation occasionally"],
    recommendations: ["Schedule regular social interactions", "Continue current wellness practices"],
    riskFlags: [],
    managerRelationship: "Excellent - strong mutual respect",
    cultureFeedback: "Highly values the company culture and team support",
  },
  "emp-003": {
    stressScore: 78,
    burnoutRisk: "High",
    overallSentiment: 55,
    strengths: ["Creativity", "Design Skills"],
    concerns: ["Heavy workload", "Sleep issues", "Feeling undervalued", "Lack of career growth"],
    recommendations: ["Urgent: Discuss workload redistribution", "Consider counseling support", "Take regular breaks", "Explore growth conversations with manager"],
    riskFlags: ["Burnout", "Sleep Issues", "Disengagement"],
    managerRelationship: "Strained - feels unheard",
    cultureFeedback: "Feels disconnected from team decisions",
  },
  "emp-005": {
    stressScore: 85,
    burnoutRisk: "High",
    overallSentiment: 48,
    strengths: ["Experience", "Technical Knowledge", "Problem Solving"],
    concerns: ["Severe burnout", "Work-life imbalance", "Constant pressure", "Isolation from team"],
    recommendations: ["Immediate workload reduction", "Consider medical leave", "Professional counseling recommended", "Reassess role expectations"],
    riskFlags: ["Burnout", "Isolation", "Work-Life Crisis"],
    managerRelationship: "Neutral - lacks meaningful support",
    cultureFeedback: "Feels the culture prioritizes output over wellbeing",
  },
  "emp-007": {
    stressScore: 92,
    burnoutRisk: "Critical",
    overallSentiment: 35,
    strengths: ["Technical Expertise"],
    concerns: ["Severe isolation", "Hopelessness", "Complete disengagement", "Sleep deprivation", "Conflict with team"],
    recommendations: ["URGENT: Immediate clinical review recommended", "Mandatory time off", "Professional mental health support", "Manager intervention required"],
    riskFlags: ["Hopelessness", "Isolation", "Burnout", "Sleep Issues", "Conflict"],
    managerRelationship: "Poor - feels bullied and unsupported",
    cultureFeedback: "Toxic environment, no psychological safety",
  },
};

// Historical trend data (monthly averages)
export const trendData = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  overallWellness: [72, 70, 68, 71, 73, 74, 72],
  burnout: [65, 63, 60, 62, 64, 66, 65],
  engagement: [75, 74, 72, 73, 75, 76, 74],
  stress: [58, 60, 63, 61, 59, 57, 60],
};

// Department-level aggregated data for HR Dashboard
export const departmentMetrics = [
  { department: "Engineering", avgWellness: 68, avgBurnout: 62, avgEngagement: 70, avgStress: 68, employeeCount: 5, riskCount: 2 },
  { department: "Design", avgWellness: 68, avgBurnout: 63, avgEngagement: 69, avgStress: 65, employeeCount: 2, riskCount: 1 },
  { department: "Marketing", avgWellness: 91, avgBurnout: 88, avgEngagement: 90, avgStress: 30, employeeCount: 1, riskCount: 0 },
  { department: "HR", avgWellness: 88, avgBurnout: 85, avgEngagement: 87, avgStress: 32, employeeCount: 1, riskCount: 0 },
  { department: "Sales", avgWellness: 68, avgBurnout: 60, avgEngagement: 70, avgStress: 55, employeeCount: 1, riskCount: 0 },
];

export const topWorkplaceIssues = [
  { issue: "Heavy Workload", count: 4, percentage: 40 },
  { issue: "Work-Life Imbalance", count: 3, percentage: 30 },
  { issue: "Burnout Symptoms", count: 3, percentage: 30 },
  { issue: "Lack of Recognition", count: 2, percentage: 20 },
  { issue: "Communication Gaps", count: 2, percentage: 20 },
  { issue: "Career Growth Concerns", count: 2, percentage: 20 },
];

export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case "Excellent": return "#10b981";
    case "Healthy": return "#22c55e";
    case "Moderate": return "#f59e0b";
    case "High Risk": return "#f97316";
    case "Critical": return "#ef4444";
    default: return "#64748b";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "#10b981";
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#f59e0b";
  if (score >= 50) return "#f97316";
  return "#ef4444";
}
