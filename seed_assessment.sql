-- ============================================================
-- Manovyatha - Seed Assessment Data
-- ============================================================
-- Run AFTER supabase_setup.sql
-- Creates: Assessment Template + 6 Categories + 46 Questions + Options
-- ============================================================
-- NOTE: Run /setup page first to create Super Admin user
-- Then run this SQL to seed the assessment.
-- ============================================================

-- ============================================================
-- 1. SUPER ADMIN
-- ============================================================
-- Created here so that assessment_templates can reference it.
-- Password hash is a placeholder - /setup page will fix it.
-- After running this SQL, go to /setup to set the real password.

INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@manovyatha.com',
  'PLACEHOLDER_RUN_SETUP_PAGE',
  'super_admin',
  true
);

-- ============================================================
-- 2. ASSESSMENT TEMPLATE
-- ============================================================

INSERT INTO assessment_templates (id, name, description, created_by)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Monthly Wellness Assessment',
  'Comprehensive employee wellness check covering mental health, burnout, workplace culture, job satisfaction, resilience, and work-life balance.',
  '00000000-0000-0000-0000-000000000001'
);

-- ============================================================
-- 3. ASSESSMENT VERSION (Published)
-- ============================================================

INSERT INTO assessment_versions (id, template_id, version_number, status, published_at, published_by)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  1,
  'published',
  NOW(),
  '00000000-0000-0000-0000-000000000001'
);

-- ============================================================
-- 4. CATEGORIES
-- ============================================================

INSERT INTO categories (id, version_id, name, weight, sort_order) VALUES
  ('c1000000-aaaa-bbbb-cccc-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Mental Wellbeing', 0.25, 1),
  ('c1000000-aaaa-bbbb-cccc-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Burnout', 0.20, 2),
  ('c1000000-aaaa-bbbb-cccc-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Workplace Culture', 0.20, 3),
  ('c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Job Satisfaction', 0.15, 4),
  ('c1000000-aaaa-bbbb-cccc-000000000005', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Resilience', 0.10, 5),
  ('c1000000-aaaa-bbbb-cccc-000000000006', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Work-Life Balance', 0.10, 6);

-- ============================================================
-- 5. QUESTIONS
-- ============================================================

-- Mental Wellbeing (8 questions)
INSERT INTO questions (id, category_id, version_id, question_text, question_type, weight, is_required, is_reverse_scored, sort_order) VALUES
  ('d1000001-1111-2222-3333-444444444401', 'c1000000-aaaa-bbbb-cccc-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel emotionally healthy.', 'likert', 1, true, false, 1),
  ('d1000001-1111-2222-3333-444444444402', 'c1000000-aaaa-bbbb-cccc-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I sleep well most nights.', 'likert', 1, true, false, 2),
  ('d1000001-1111-2222-3333-444444444403', 'c1000000-aaaa-bbbb-cccc-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel optimistic about the future.', 'likert', 1, true, false, 3),
  ('d1000001-1111-2222-3333-444444444404', 'c1000000-aaaa-bbbb-cccc-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I can manage stress effectively.', 'likert', 1, true, false, 4),
  ('d1000001-1111-2222-3333-444444444405', 'c1000000-aaaa-bbbb-cccc-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel energetic during the day.', 'likert', 1, true, false, 5),
  ('d1000001-1111-2222-3333-444444444406', 'c1000000-aaaa-bbbb-cccc-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I rarely feel anxious without reason.', 'likert', 1, true, false, 6),
  ('d1000001-1111-2222-3333-444444444407', 'c1000000-aaaa-bbbb-cccc-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel confident in my abilities.', 'likert', 1, true, false, 7),
  ('d1000001-1111-2222-3333-444444444408', 'c1000000-aaaa-bbbb-cccc-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I can focus on tasks without difficulty.', 'likert', 1, true, false, 8);

-- Burnout (8 questions - REVERSE SCORED)
INSERT INTO questions (id, category_id, version_id, question_text, question_type, weight, is_required, is_reverse_scored, sort_order) VALUES
  ('d1000002-1111-2222-3333-444444444401', 'c1000000-aaaa-bbbb-cccc-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel exhausted after work.', 'likert', 1, true, true, 1),
  ('d1000002-1111-2222-3333-444444444402', 'c1000000-aaaa-bbbb-cccc-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I dread Mondays.', 'likert', 1, true, true, 2),
  ('d1000002-1111-2222-3333-444444444403', 'c1000000-aaaa-bbbb-cccc-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I have difficulty concentrating.', 'likert', 1, true, true, 3),
  ('d1000002-1111-2222-3333-444444444404', 'c1000000-aaaa-bbbb-cccc-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel detached from my work.', 'likert', 1, true, true, 4),
  ('d1000002-1111-2222-3333-444444444405', 'c1000000-aaaa-bbbb-cccc-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel overwhelmed by my workload.', 'likert', 1, true, true, 5),
  ('d1000002-1111-2222-3333-444444444406', 'c1000000-aaaa-bbbb-cccc-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel cynical about my job.', 'likert', 1, true, true, 6),
  ('d1000002-1111-2222-3333-444444444407', 'c1000000-aaaa-bbbb-cccc-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I lack the energy to start new projects.', 'likert', 1, true, true, 7),
  ('d1000002-1111-2222-3333-444444444408', 'c1000000-aaaa-bbbb-cccc-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel emotionally drained by my work.', 'likert', 1, true, true, 8);

-- Workplace Culture (8 questions)
INSERT INTO questions (id, category_id, version_id, question_text, question_type, weight, is_required, is_reverse_scored, sort_order) VALUES
  ('d1000003-1111-2222-3333-444444444401', 'c1000000-aaaa-bbbb-cccc-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'My manager supports my professional growth.', 'likert', 1, true, false, 1),
  ('d1000003-1111-2222-3333-444444444402', 'c1000000-aaaa-bbbb-cccc-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'My team respects my opinions.', 'likert', 1, true, false, 2),
  ('d1000003-1111-2222-3333-444444444403', 'c1000000-aaaa-bbbb-cccc-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Communication in my team is transparent.', 'likert', 1, true, false, 3),
  ('d1000003-1111-2222-3333-444444444404', 'c1000000-aaaa-bbbb-cccc-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel psychologically safe at work.', 'likert', 1, true, false, 4),
  ('d1000003-1111-2222-3333-444444444405', 'c1000000-aaaa-bbbb-cccc-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Diversity and inclusion are valued here.', 'likert', 1, true, false, 5),
  ('d1000003-1111-2222-3333-444444444406', 'c1000000-aaaa-bbbb-cccc-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Feedback is given constructively.', 'likert', 1, true, false, 6),
  ('d1000003-1111-2222-3333-444444444407', 'c1000000-aaaa-bbbb-cccc-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Conflicts are resolved fairly.', 'likert', 1, true, false, 7),
  ('d1000003-1111-2222-3333-444444444408', 'c1000000-aaaa-bbbb-cccc-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I trust my leadership team.', 'likert', 1, true, false, 8);

-- Job Satisfaction (10 questions)
INSERT INTO questions (id, category_id, version_id, question_text, question_type, weight, is_required, is_reverse_scored, sort_order) VALUES
  ('d1000004-1111-2222-3333-444444444401', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I enjoy my work.', 'likert', 1, true, false, 1),
  ('d1000004-1111-2222-3333-444444444402', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I understand my responsibilities clearly.', 'likert', 1, true, false, 2),
  ('d1000004-1111-2222-3333-444444444403', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'My work feels meaningful.', 'likert', 1, true, false, 3),
  ('d1000004-1111-2222-3333-444444444404', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I receive recognition for my efforts.', 'likert', 1, true, false, 4),
  ('d1000004-1111-2222-3333-444444444405', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel motivated to do my best at work.', 'likert', 1, true, false, 5),
  ('d1000004-1111-2222-3333-444444444406', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I am satisfied with my career growth opportunities.', 'likert', 1, true, false, 6),
  ('d1000004-1111-2222-3333-444444444407', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel valued by my organization.', 'likert', 1, true, false, 7),
  ('d1000004-1111-2222-3333-444444444408', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'My skills are well-utilized in my role.', 'likert', 1, true, false, 8),
  ('d1000004-1111-2222-3333-444444444409', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I would recommend my workplace to others.', 'likert', 1, true, false, 9),
  ('d1000004-1111-2222-3333-444444444410', 'c1000000-aaaa-bbbb-cccc-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I feel aligned with the company mission.', 'likert', 1, true, false, 10);

-- Resilience (6 questions)
INSERT INTO questions (id, category_id, version_id, question_text, question_type, weight, is_required, is_reverse_scored, sort_order) VALUES
  ('d1000005-1111-2222-3333-444444444401', 'c1000000-aaaa-bbbb-cccc-000000000005', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I adapt well to change.', 'likert', 1, true, false, 1),
  ('d1000005-1111-2222-3333-444444444402', 'c1000000-aaaa-bbbb-cccc-000000000005', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I recover quickly after setbacks.', 'likert', 1, true, false, 2),
  ('d1000005-1111-2222-3333-444444444403', 'c1000000-aaaa-bbbb-cccc-000000000005', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I remain calm under pressure.', 'likert', 1, true, false, 3),
  ('d1000005-1111-2222-3333-444444444404', 'c1000000-aaaa-bbbb-cccc-000000000005', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I can handle uncertainty effectively.', 'likert', 1, true, false, 4),
  ('d1000005-1111-2222-3333-444444444405', 'c1000000-aaaa-bbbb-cccc-000000000005', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I learn from my failures.', 'likert', 1, true, false, 5),
  ('d1000005-1111-2222-3333-444444444406', 'c1000000-aaaa-bbbb-cccc-000000000005', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I maintain a positive outlook during challenges.', 'likert', 1, true, false, 6);

-- Work-Life Balance (6 questions)
INSERT INTO questions (id, category_id, version_id, question_text, question_type, weight, is_required, is_reverse_scored, sort_order) VALUES
  ('d1000006-1111-2222-3333-444444444401', 'c1000000-aaaa-bbbb-cccc-000000000006', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I can disconnect from work after hours.', 'likert', 1, true, false, 1),
  ('d1000006-1111-2222-3333-444444444402', 'c1000000-aaaa-bbbb-cccc-000000000006', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I have enough personal time.', 'likert', 1, true, false, 2),
  ('d1000006-1111-2222-3333-444444444403', 'c1000000-aaaa-bbbb-cccc-000000000006', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I rarely work overtime.', 'likert', 1, true, false, 3),
  ('d1000006-1111-2222-3333-444444444404', 'c1000000-aaaa-bbbb-cccc-000000000006', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'My organization respects work-life boundaries.', 'likert', 1, true, false, 4),
  ('d1000006-1111-2222-3333-444444444405', 'c1000000-aaaa-bbbb-cccc-000000000006', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'I can take time off when needed.', 'likert', 1, true, false, 5),
  ('d1000006-1111-2222-3333-444444444406', 'c1000000-aaaa-bbbb-cccc-000000000006', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'My workload is manageable within work hours.', 'likert', 1, true, false, 6);

-- ============================================================
-- 6. LIKERT OPTIONS (for all 46 questions)
-- ============================================================

DO $$
DECLARE
  q_id UUID;
BEGIN
  FOR q_id IN SELECT id FROM questions WHERE version_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
  LOOP
    INSERT INTO question_options (question_id, label, value, sort_order) VALUES
      (q_id, 'Strongly Disagree', 1, 0),
      (q_id, 'Disagree', 2, 1),
      (q_id, 'Neutral', 3, 2),
      (q_id, 'Agree', 4, 3),
      (q_id, 'Strongly Agree', 5, 4);
  END LOOP;
END $$;

-- ============================================================
-- DONE!
-- ============================================================
-- After running this:
-- 1. Visit /setup to create the Super Admin user (proper password hash)
-- 2. Login at /login with admin@manovyatha.com / Wellness@12345
-- 3. The assessment is already published and ready for employees
-- ============================================================
