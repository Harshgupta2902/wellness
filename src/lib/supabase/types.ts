// Database type definitions for Supabase
// These map to the tables defined in supabase_setup.sql

export type UserRole = "super_admin" | "org_admin" | "employee";
export type OrgStatus = "active" | "inactive" | "suspended";
export type AssessmentStatus = "draft" | "published" | "archived";
export type QuestionType = "likert" | "stars" | "numeric" | "yes_no" | "slider" | "nps";
export type RiskLevel = "excellent" | "healthy" | "moderate" | "high_risk" | "critical";
export type EmployeeStatus = "active" | "inactive" | "invited";
export type PersonalFieldType = "text" | "number" | "email" | "select" | "date" | "radio";
export type AuditAction =
  | "login"
  | "logout"
  | "invite_sent"
  | "employee_created"
  | "organization_created"
  | "organization_updated"
  | "assessment_created"
  | "assessment_published"
  | "assessment_submitted"
  | "question_created"
  | "question_updated"
  | "category_created"
  | "category_updated"
  | "ai_generated"
  | "email_sent"
  | "encryption_key_rotated";

// Row types
export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  employee_count: number;
  status: OrgStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  organization_id: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface Employee {
  id: string;
  user_id: string;
  organization_id: string;
  encrypted_name: string;
  encrypted_age: string | null;
  encrypted_gender: string | null;
  encrypted_phone: string | null;
  encrypted_department: string;
  encrypted_designation: string | null;
  encrypted_employee_id: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface AssessmentVersion {
  id: string;
  template_id: string;
  version_number: number;
  status: AssessmentStatus;
  published_at: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface Category {
  id: string;
  version_id: string;
  name: string;
  weight: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface Question {
  id: string;
  category_id: string;
  version_id: string;
  question_text: string;
  question_type: QuestionType;
  weight: number;
  is_required: boolean;
  is_reverse_scored: boolean;
  sort_order: number;
  condition_question_id: string | null;
  condition_operator: string | null;
  condition_value: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  label: string;
  value: number;
  sort_order: number;
  created_at: string;
}

export interface PersonalInfoField {
  id: string;
  version_id: string;
  field_name: string;
  field_label: string;
  field_type: PersonalFieldType;
  is_required: boolean;
  is_encrypted: boolean;
  options: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface Assessment {
  id: string;
  employee_id: string;
  organization_id: string;
  version_id: string;
  overall_score: number | null;
  risk_level: RiskLevel | null;
  submitted_at: string;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface AssessmentAnswer {
  id: string;
  assessment_id: string;
  question_id: string;
  answer_value: number | null;
  answer_text: string | null;
  calculated_score: number | null;
  created_at: string;
}

export interface AssessmentPersonalInfo {
  id: string;
  assessment_id: string;
  field_id: string;
  encrypted_value: string;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  assessment_id: string;
  stress_score: number | null;
  burnout_risk: string | null;
  overall_sentiment: number | null;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  risk_flags: string[];
  manager_relationship: string | null;
  culture_feedback: string | null;
  raw_response: Record<string, unknown> | null;
  generated_at: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// Supabase Database type mapping
export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> };
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      employees: { Row: Employee; Insert: Partial<Employee>; Update: Partial<Employee> };
      assessment_templates: { Row: AssessmentTemplate; Insert: Partial<AssessmentTemplate>; Update: Partial<AssessmentTemplate> };
      assessment_versions: { Row: AssessmentVersion; Insert: Partial<AssessmentVersion>; Update: Partial<AssessmentVersion> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      questions: { Row: Question; Insert: Partial<Question>; Update: Partial<Question> };
      question_options: { Row: QuestionOption; Insert: Partial<QuestionOption>; Update: Partial<QuestionOption> };
      personal_info_fields: { Row: PersonalInfoField; Insert: Partial<PersonalInfoField>; Update: Partial<PersonalInfoField> };
      assessments: { Row: Assessment; Insert: Partial<Assessment>; Update: Partial<Assessment> };
      assessment_answers: { Row: AssessmentAnswer; Insert: Partial<AssessmentAnswer>; Update: Partial<AssessmentAnswer> };
      assessment_personal_info: { Row: AssessmentPersonalInfo; Insert: Partial<AssessmentPersonalInfo>; Update: Partial<AssessmentPersonalInfo> };
      ai_analyses: { Row: AIAnalysis; Insert: Partial<AIAnalysis>; Update: Partial<AIAnalysis> };
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog> };
    };
  };
}
