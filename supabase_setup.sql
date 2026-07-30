-- ============================================================
-- Manovyatha - Complete Database Schema
-- ============================================================
-- Run this file to create the entire database from scratch.
-- Last Updated: 2026-07-30
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'org_admin', 'employee');
CREATE TYPE org_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE assessment_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE question_type AS ENUM ('likert', 'stars', 'numeric', 'yes_no', 'slider', 'nps');
CREATE TYPE risk_level AS ENUM ('excellent', 'healthy', 'moderate', 'high_risk', 'critical');
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'invited');
CREATE TYPE personal_field_type AS ENUM ('text', 'number', 'email', 'select', 'date', 'radio');
CREATE TYPE audit_action AS ENUM (
  'login',
  'logout',
  'invite_sent',
  'employee_created',
  'organization_created',
  'organization_updated',
  'assessment_created',
  'assessment_published',
  'assessment_submitted',
  'question_created',
  'question_updated',
  'category_created',
  'category_updated',
  'ai_generated',
  'email_sent',
  'encryption_key_rotated'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  employee_count INTEGER DEFAULT 0,
  status org_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- Users (all roles in one table, role-based access)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  organization_id UUID REFERENCES organizations(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- Employees (extended profile with encrypted PII)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  encrypted_name TEXT NOT NULL,
  encrypted_age TEXT,
  encrypted_gender TEXT,
  encrypted_phone TEXT,
  encrypted_department TEXT NOT NULL,
  encrypted_designation TEXT,
  encrypted_employee_id TEXT,
  status employee_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- Assessment Templates
CREATE TABLE assessment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- Assessment Versions (immutable once published)
CREATE TABLE assessment_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES assessment_templates(id),
  version_number INTEGER NOT NULL DEFAULT 1,
  status assessment_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  UNIQUE(template_id, version_number)
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES assessment_versions(id),
  name TEXT NOT NULL,
  weight DECIMAL(5,4) NOT NULL DEFAULT 0.0, -- e.g., 0.25 for 25%
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id),
  version_id UUID NOT NULL REFERENCES assessment_versions(id),
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'likert',
  weight DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_reverse_scored BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Conditional logic
  condition_question_id UUID REFERENCES questions(id),
  condition_operator TEXT, -- '==', '!=', '>', '<', '>=', '<='
  condition_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- Question Options (dynamic per question type)
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id),
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Personal Information Fields (dynamic builder)
CREATE TABLE personal_info_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES assessment_versions(id),
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type personal_field_type NOT NULL DEFAULT 'text',
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_encrypted BOOLEAN NOT NULL DEFAULT true,
  options JSONB, -- for select/radio types
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- Assessments (submitted by employees)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  version_id UUID NOT NULL REFERENCES assessment_versions(id),
  overall_score DECIMAL(5,2),
  risk_level risk_level,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- Assessment Answers
CREATE TABLE assessment_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  question_id UUID NOT NULL REFERENCES questions(id),
  answer_value INTEGER, -- numeric answer
  answer_text TEXT, -- text/open-ended answer
  calculated_score DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assessment Personal Info Responses
CREATE TABLE assessment_personal_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  field_id UUID NOT NULL REFERENCES personal_info_fields(id),
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Analysis Results
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  stress_score DECIMAL(5,2),
  burnout_risk TEXT,
  overall_sentiment DECIMAL(5,2),
  strengths JSONB DEFAULT '[]'::jsonb,
  concerns JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  risk_flags JSONB DEFAULT '[]'::jsonb,
  manager_relationship TEXT,
  culture_feedback TEXT,
  raw_response JSONB, -- store full Gemini response
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action audit_action NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_organization ON employees(organization_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_assessment_versions_template ON assessment_versions(template_id);
CREATE INDEX idx_assessment_versions_status ON assessment_versions(status);
CREATE INDEX idx_categories_version ON categories(version_id);
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_version ON questions(version_id);
CREATE INDEX idx_question_options_question ON question_options(question_id);
CREATE INDEX idx_personal_info_fields_version ON personal_info_fields(version_id);
CREATE INDEX idx_assessments_employee ON assessments(employee_id);
CREATE INDEX idx_assessments_organization ON assessments(organization_id);
CREATE INDEX idx_assessments_version ON assessments(version_id);
CREATE INDEX idx_assessments_submitted ON assessments(submitted_at);
CREATE INDEX idx_assessment_answers_assessment ON assessment_answers(assessment_id);
CREATE INDEX idx_assessment_answers_question ON assessment_answers(question_id);
CREATE INDEX idx_ai_analyses_assessment ON ai_analyses(assessment_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get next version number for a template
CREATE OR REPLACE FUNCTION get_next_version_number(p_template_id UUID)
RETURNS INTEGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) INTO max_version
  FROM assessment_versions
  WHERE template_id = p_template_id;
  RETURN max_version + 1;
END;
$$ LANGUAGE plpgsql;

-- Check if employee can retake assessment (15 day rule)
CREATE OR REPLACE FUNCTION can_retake_assessment(p_employee_id UUID, p_version_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_submitted TIMESTAMPTZ;
BEGIN
  SELECT MAX(submitted_at) INTO last_submitted
  FROM assessments
  WHERE employee_id = p_employee_id
    AND version_id = p_version_id
    AND deleted_at IS NULL;

  IF last_submitted IS NULL THEN
    RETURN true;
  END IF;

  RETURN (NOW() - last_submitted) >= INTERVAL '15 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_assessment_templates_updated_at
  BEFORE UPDATE ON assessment_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_assessment_versions_updated_at
  BEFORE UPDATE ON assessment_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_personal_info_fields_updated_at
  BEFORE UPDATE ON personal_info_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_info_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Super Admin: full access to everything
CREATE POLICY super_admin_all_organizations ON organizations
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_users ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_employees ON employees
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_templates ON assessment_templates
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_versions ON assessment_versions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_categories ON categories
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_questions ON questions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_options ON question_options
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_personal_fields ON personal_info_fields
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_assessments ON assessments
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_answers ON assessment_answers
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_personal_info ON assessment_personal_info
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_ai ON ai_analyses
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

CREATE POLICY super_admin_all_audit ON audit_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin')
  );

-- Org Admin: access own organization data
CREATE POLICY org_admin_own_org ON organizations
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT organization_id FROM users WHERE users.id = auth.uid() AND users.role = 'org_admin')
  );

CREATE POLICY org_admin_own_employees ON employees
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid() AND users.role = 'org_admin')
  );

CREATE POLICY org_admin_own_assessments ON assessments
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid() AND users.role = 'org_admin')
  );

-- Employee: access own data
CREATE POLICY employee_own_data ON employees
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY employee_own_assessments ON assessments
  FOR ALL TO authenticated
  USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  );

CREATE POLICY employee_own_answers ON assessment_answers
  FOR ALL TO authenticated
  USING (
    assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN employees e ON a.employee_id = e.id
      WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY employee_own_ai ON ai_analyses
  FOR SELECT TO authenticated
  USING (
    assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN employees e ON a.employee_id = e.id
      WHERE e.user_id = auth.uid()
    )
  );

-- Published assessment content is readable by all authenticated users
CREATE POLICY read_published_versions ON assessment_versions
  FOR SELECT TO authenticated
  USING (status = 'published');

CREATE POLICY read_published_categories ON categories
  FOR SELECT TO authenticated
  USING (
    version_id IN (SELECT id FROM assessment_versions WHERE status = 'published')
  );

CREATE POLICY read_published_questions ON questions
  FOR SELECT TO authenticated
  USING (
    version_id IN (SELECT id FROM assessment_versions WHERE status = 'published')
  );

CREATE POLICY read_published_options ON question_options
  FOR SELECT TO authenticated
  USING (
    question_id IN (
      SELECT q.id FROM questions q
      JOIN assessment_versions v ON q.version_id = v.id
      WHERE v.status = 'published'
    )
  );

CREATE POLICY read_published_personal_fields ON personal_info_fields
  FOR SELECT TO authenticated
  USING (
    version_id IN (SELECT id FROM assessment_versions WHERE status = 'published')
  );

-- ============================================================
-- SEED DATA
-- ============================================================

-- Create Super Admin user (password: Wellness@12345)
-- Note: In production, use Supabase Auth. This is for MVP with master password.
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@manovyatha.com',
  crypt('mano@manovyatha#', gen_salt('bf')),
  'super_admin',
  true
);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
