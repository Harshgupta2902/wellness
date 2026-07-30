# Manovyatha - Development Roadmap

> Last Updated: 2026-07-30

---

# Project Status

## Current State

- ✅ Next.js Frontend
- ✅ Assessment UI
- ✅ Employee Dashboard
- ✅ HR Dashboard
- ✅ Local Storage
- ✅ Static Questions
- ✅ Static Scoring
- ❌ Authentication
- ❌ Database
- ❌ AI Integration
- ❌ Dynamic Assessment Builder
- ❌ Organizations
- ❌ Users
- ❌ Encryption
- ❌ Notifications

---

# Tech Stack

Frontend
- Next.js 16
- React 19
- TypeScript
- TailwindCSS

Backend
- Next.js API Routes

Database
- Supabase PostgreSQL

Authentication (MVP)
- Email
- Master Password

AI
- Google Gemini API

Charts
- Chart.js

Email
- Resend / SMTP

Encryption
- AES-256

---

# User Hierarchy

```
Super Admin
│
├── Organizations
│      │
│      ├── Organization Admin
│      │
│      └── Employees
```

---

# Roles

## Super Admin

Can

- Manage Organizations
- Manage Assessment Templates
- Publish Assessments
- Create Versions
- Manage Categories
- Manage Questions
- Manage Question Types
- Manage Personal Fields
- View Every Organization
- View Every Assessment
- View AI Insights
- View Audit Logs

---

## Organization Admin

Can

- View only own Organization
- Invite Employees
- View Dashboard
- View Statistics
- Receive Critical Alerts

Only one active Organization Admin per organization.

---

## Employee

Can

- Take Assessment
- Login
- View Previous Assessments
- View AI Recommendations
- Retake Assessment after 15 days

---

# Authentication

Current MVP

Email

Master Password

```
Wellness@12345
```

Future

Supabase Auth

---

# Database Rules

## IMPORTANT

There will always be TWO SQL files.

```
supabase_setup.sql
updates.sql
```

---

## supabase_setup.sql

Contains COMPLETE database schema.

Whenever a new developer creates a project from scratch,

running this file should completely recreate the database.

This file MUST always contain

- Tables
- Indexes
- Constraints
- Triggers
- Views
- Functions
- Policies
- Seed Data (if required)

Think of this as

```
Master Database File
```

---

## updates.sql

Contains ONLY incremental changes.

Example

```
ALTER TABLE employees
ADD COLUMN phone TEXT;
```

After this change has been applied successfully,

1. Merge this change into

```
supabase_setup.sql
```

2. Empty

```
updates.sql
```

3. Future changes will be added here.

Meaning

```
updates.sql

always contains ONLY the current migration.
```

Never keep historical SQL here.

---

# Database Design

## Organizations

- id
- name
- industry
- employee_count
- status
- created_at

---

## Organization Admin

- id
- organization_id
- email
- active

Only one admin per organization.

---

## Employees

Store

- Organization
- Email
- Encrypted Personal Information
- Status

Personal Information

- Name
- Age
- Gender
- Phone
- Department
- Designation
- Employee ID

All encrypted.

---

## Assessment Templates

Examples

- Monthly
- Quarterly
- Exit Survey

Managed ONLY by Super Admin.

---

## Assessment Versions

Every edit

↓

Creates New Version

No edits on published versions.

---

## Categories

Managed by Super Admin

Fields

- Name
- Weight
- Order

---

## Questions

Fields

- Category
- Type
- Weight
- Required
- Reverse Score
- Condition
- Order

---

## Options

Dynamic

Supports

- Likert
- Stars
- Numeric
- Yes/No
- Slider
- NPS

---

## Personal Information Fields

Dynamic Builder

Examples

- Name
- Age
- Employee ID
- Joining Date
- Manager

Everything configurable.

---

## Assessments

Stores

- Employee
- Organization
- Version
- Score
- Risk
- Submitted Date

---

## Answers

Stores

Every answer

with calculated score.

---

## AI Analysis

Stores

- Stress
- Burnout
- Sentiment
- Strengths
- Concerns
- Recommendations
- Risk Flags

Store raw Gemini response.

---

## Audit Logs

Track EVERYTHING.

Examples

- Login
- Invite Sent
- Question Created
- Assessment Published
- Organization Created
- AI Generated
- Email Sent

---

# Assessment Rules

## Assessment Builder

Super Admin can

Create Assessment

↓

Create Categories

↓

Assign Category Weight

↓

Create Questions

↓

Assign Question Weight

↓

Assign Question Type

↓

Assign Options

↓

Assign Conditions

↓

Publish Version

---

Published versions

Cannot be edited.

Any edit

↓

Creates Version +1

---

# Question Types

Supported

- Likert (1-5)
- Stars
- Numeric Rating
- Yes / No
- Slider
- NPS

---

# Conditional Questions

Supported

Example

```
IF

Question 15 == Yes

↓

Show Question 16

Else

Hide
```

---

# Scoring

Category Weight

Example

Mental Health

30%

Questions inside category

Question A

20%

Question B

30%

Question C

50%

Category Score

↓

Weighted Score

↓

Overall Score

---

# AI

Provider

Google Gemini

Input

Entire Assessment

Output

JSON

Contains

- Sentiment
- Stress
- Burnout
- Manager Feedback
- Employee Recommendation
- Organization Recommendation
- Risk Flags

---

# Notifications

Send Email

Employee

- Assessment Complete

Organization Admin

- Critical Risk
- Assessment Submitted

---

# Dashboard

## Super Admin

- Organizations
- Employees
- Assessments
- Risk
- AI
- Statistics

---

## Organization

- Wellness
- Burnout
- Department
- Gender
- Age
- Experience
- Monthly Trends
- Risk Distribution

---

## Employee

- History
- Current Score
- AI Recommendations
- Charts
- Retake Date

---

# Retake Rules

Employee

↓

Submits Assessment

↓

Assessment Locked

↓

Can View Only

↓

15 Days

↓

Retake Enabled

---

# Encryption

Encrypt

- Name
- Email
- Phone
- Gender
- Age
- Employee ID

Do NOT encrypt

- Scores
- Category IDs
- Question IDs
- Organization IDs

Reason

Allows reporting and analytics.

---

# Soft Delete

Every table should contain

- deleted_at
- deleted_by

Never permanently delete records.

---

# Multi-language

Future Ready

Languages

- English
- Hindi
- Gujarati
- Marathi

---

# Development Phases

## Phase 1 (Current)

- [ ] Setup Supabase
- [ ] Create Database
- [ ] Create SQL Files
- [ ] Setup RLS
- [ ] Setup Encryption Helpers
- [ ] Setup API

---

## Phase 2

- [ ] Organization CRUD
- [ ] Organization Dashboard
- [ ] Invite Employee
- [ ] Employee Registration

---

## Phase 3

- [ ] Dynamic Assessment Builder
- [ ] Categories
- [ ] Questions
- [ ] Conditional Logic
- [ ] Versioning
- [ ] Publish Workflow

---

## Phase 4

- [ ] Assessment Submission
- [ ] Store Responses
- [ ] Scoring Engine
- [ ] AI Integration

---

## Phase 5

- [ ] Employee Dashboard
- [ ] Organization Dashboard
- [ ] Notifications
- [ ] Audit Logs

---

# Development Rules

## Rule 1

Never hardcode

Questions

Categories

Weights

Personal Information

Everything must come from the database.

---

## Rule 2

Never modify a published assessment.

Always create a new version.

---

## Rule 3

Never directly alter production schema.

Always

1. Update `updates.sql`
2. Test migration
3. Merge into `supabase_setup.sql`
4. Clear `updates.sql`

---

## Rule 4

Always use transactions for database updates affecting multiple tables.

---

## Rule 5

All API responses should follow

```
{
  success: boolean,
  message: string,
  data: {}
}
```

---

## Rule 6

Store only encrypted PII.

Decryption must happen only on the server.

Never expose encryption keys to the client.

---

# Immediate Next Tasks

Priority 1

- [ ] Setup Supabase Project
- [ ] Create `supabase_setup.sql`
- [ ] Create `updates.sql`
- [ ] Configure RLS
- [ ] Create encryption utilities
- [ ] Replace localStorage with Supabase

Priority 2

- [ ] Organizations
- [ ] Organization Admin
- [ ] Employees
- [ ] Invites

Priority 3

- [ ] Assessment Builder
- [ ] Versioning
- [ ] Dynamic Questions

Priority 4

- [ ] AI
- [ ] Notifications
- [ ] Dashboards

---

# Definition of Done

The project is considered MVP complete when:

- Organizations can be managed by Super Admin.
- One Organization Admin exists per organization.
- Employees can be invited or auto-created.
- Assessments are fully database-driven.
- Assessment versioning is immutable.
- PII is encrypted at rest.
- Responses are stored in Supabase.
- AI analysis is generated using Gemini.
- Organization dashboards display aggregated insights.
- Employees can securely view their own results.
- Every schema change follows the `updates.sql` → `supabase_setup.sql` workflow.
