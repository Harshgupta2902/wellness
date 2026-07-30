# Manovyatha — Employee Wellness & Psychological Assessment Platform

## Overview

Manovyatha is an AI-powered employee wellness assessment platform built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4**, and **Chart.js**. It enables organizations to assess, monitor, and improve employee mental health and workplace wellbeing through confidential, clinically-weighted questionnaires, automated scoring, AI-driven insights, and aggregated HR analytics.

The name "Manovyatha" (मनोव्यथा) draws from Sanskrit, relating to the mind and its wellness.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Framework    | Next.js 16 (App Router)           |
| UI Library   | React 19                          |
| Language     | TypeScript 5                      |
| Styling      | Tailwind CSS 4 + PostCSS          |
| Charts       | Chart.js + react-chartjs-2        |
| Icons        | Lucide React                      |
| Persistence  | Browser localStorage              |
| Linting      | ESLint 9 + eslint-config-next     |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                      # Landing / Home page
│   ├── layout.tsx                    # Root layout with metadata
│   ├── globals.css                   # Global styles & Tailwind
│   ├── assessment/
│   │   └── page.tsx                  # Multi-step assessment wizard
│   └── dashboard/
│       ├── employee/
│       │   └── page.tsx              # Individual employee wellness report
│       └── hr/
│           └── page.tsx              # Aggregated HR analytics dashboard
├── data/
│   ├── questions.ts                  # Question bank, categories, weights
│   └── mock-data.ts                  # Sample employees, scores, AI analyses
└── lib/
    ├── scoring.ts                    # Scoring engine (weighted, per-category)
    └── storage.ts                    # localStorage persistence layer
```

---

## Core Features

### 1. Landing Page (`/`)

- Brand introduction and platform overview
- Explains the three-step flow: Assessment → AI Analysis → Actionable Insights
- Displays all 6 assessment categories with their scoring weights
- Privacy & confidentiality assurance section
- Navigation to Assessment, Employee Dashboard, and HR Dashboard

---

### 2. Wellness Assessment (`/assessment`)

A multi-step wizard that walks employees through a full psychological assessment.

#### Steps:
1. **Personal Information** — Name, email, age, department, designation, experience, work mode (Remote / Hybrid / On-site)
2. **Likert-Scale Questions** — 46 questions across 6 categories, answered on a 5-point scale (Strongly Disagree → Strongly Agree)
3. **Open-Ended Questions** — 4 free-text questions for qualitative AI analysis
4. **Results** — Instant scoring with overall score, risk level, and category breakdown

#### Assessment Categories & Weights:

| Category            | Weight | Questions | Description                                              |
|---------------------|--------|-----------|----------------------------------------------------------|
| Mental Wellbeing    | 25%    | 8         | Emotional health, sleep, optimism, stress management     |
| Burnout             | 20%    | 8         | Exhaustion, detachment, concentration (reverse-scored)   |
| Workplace Culture   | 20%    | 8         | Manager support, transparency, psychological safety      |
| Job Satisfaction    | 15%    | 10        | Purpose, recognition, motivation, career growth          |
| Resilience          | 10%    | 6         | Adaptability, recovery from setbacks, calm under pressure|
| Work-Life Balance   | 10%    | 6         | Disconnect ability, personal time, boundaries            |

#### Scoring Logic:
- Each question scored 1–5 on a Likert scale
- Burnout questions are **reverse-scored** (higher agreement = lower wellness)
- Category percentage = (total score / max possible score) × 100
- Overall score = weighted sum of all category percentages
- Risk levels: Critical (<50), High Risk (50–64), Moderate (65–79), Healthy (80–89), Excellent (90–100)

#### Open-Ended Questions:
1. "What motivates you at work?"
2. "What stresses you the most?"
3. "What would improve your workplace?"
4. "Describe how you've been feeling recently."

These are designed for future AI/NLP sentiment analysis.

---

### 3. Employee Dashboard (`/dashboard/employee`)

A personal wellness report for the individual employee.

#### Features:
- Welcome banner with employee name, designation, department, and last assessment date
- **Overall wellness score** prominently displayed
- **6 category score cards** with color-coded indicators
- **Radar chart** showing wellness profile across all categories
- **Bar-style progress indicators** for each category
- **AI Insights panel** showing:
  - Stress level score
  - Burnout risk level
  - Sentiment score
  - Manager relationship assessment
- **Strengths** — positive areas identified
- **Concerns** — areas needing attention
- **Recommendations** — personalized action items
- **Risk flags** — critical indicators
- **Risk level scale** with visual indicator
- Falls back to mock data if no real assessment has been completed

---

### 4. HR Dashboard (`/dashboard/hr`)

An aggregated, anonymized analytics view for HR professionals.

#### Features:
- **KPI Cards**: Average wellness, burnout score, high-risk employee count, average engagement
- **Department bar chart**: Comparing wellness and burnout scores across departments
- **Wellness trend line chart**: Monthly wellness score tracking
- **Risk level doughnut chart**: Distribution of employees across risk categories
- **Top workplace issues**: Ranked list of organizational concerns with percentages
- **Department heatmap**: Color-coded wellness/burnout/culture/work-life scores per department
- **Department risk summary table**: Employees, avg score, at-risk count, status
- **All assessments table**: Individual records with name, department, score, risk level, date
- **Empty state**: Helpful prompt if no assessments exist yet

#### Privacy Controls:
- No individual clinical data exposed without consent
- Only department-level aggregates shown
- Privacy notice displayed prominently

---

## Data Persistence

All assessment data is stored in the browser's **localStorage** under the key `manovyatha_assessments`.

### Storage API (`src/lib/storage.ts`):
- `saveAssessment(assessment)` — Appends a completed assessment
- `getAssessments()` — Retrieves all saved assessments
- `getLatestAssessment()` — Gets the most recent assessment
- `clearAssessments()` — Removes all stored data

### Saved Data Structure:
```typescript
{
  id: string;                    // Unique assessment ID
  personalInfo: {                // Employee details
    name, email, age, department, designation, experience, workMode
  };
  answers: Record<number, number>;     // Question ID → Likert value (1-5)
  textAnswers: Record<number, string>; // Question ID → free text response
  scores: {
    overallScore: number;
    riskLevel: string;
    categoryScores: { category: string; percentage: number }[];
  };
  submittedAt: string;           // ISO date string
}
```

---

## Mock Data

The platform includes realistic mock data (`src/data/mock-data.ts`) for demonstration:

- **1 company**: TechVista Solutions (250 employees, India, Technology)
- **10 sample employees** across Engineering, Design, Marketing, HR, and Sales
- **10 assessment results** spanning all risk levels (Critical to Excellent)
- **5 detailed AI analyses** including strengths, concerns, recommendations, and risk flags
- **Historical trend data** (7 months)
- **Department-level metrics** for 5 departments

---

## UI/UX Design

- Clean, modern interface with card-based layouts
- Color-coded scoring (green → amber → orange → red) for instant comprehension
- Responsive design (mobile-friendly grid layouts)
- Smooth transitions and hover effects
- Progress bar during assessment
- Sticky navigation headers
- Gradient hero sections
- Accessible form controls with proper labels

---

## Risk Classification System

| Level      | Score Range | Color  | Action                          |
|------------|-------------|--------|---------------------------------|
| Excellent  | 90–100      | Green  | Maintain current practices      |
| Healthy    | 80–89       | Green  | Continue with minor improvements|
| Moderate   | 65–79       | Amber  | Monitor and support             |
| High Risk  | 50–64       | Orange | Intervention recommended        |
| Critical   | < 50        | Red    | Urgent clinical review required |

---

## Future Enhancements (Architecture Ready)

- **AI/NLP Integration**: Open-ended responses structured for sentiment analysis
- **Backend API**: Storage layer abstracted for easy swap to database
- **Authentication**: Role-based access (employee vs HR) ready to implement
- **Real-time Notifications**: Risk flag alerts for HR
- **Longitudinal Tracking**: Compare assessments over time per employee
- **Export/Reporting**: PDF reports, CSV exports
- **Multi-company Support**: Data model includes company entity

---

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

The app runs on `http://localhost:3000` by default.

---

## Key Design Decisions

1. **Client-side only**: No backend required — localStorage keeps it simple and private
2. **Weighted scoring**: Clinically-informed weights prioritize mental wellbeing and burnout
3. **Reverse scoring**: Burnout questions use inverse scoring for accurate measurement
4. **Privacy-first**: HR dashboard never exposes individual clinical details
5. **Progressive disclosure**: Assessment broken into category-by-category steps to reduce overwhelm
6. **Hydration safety**: Dashboard pages handle SSR/client mismatch with mounted state guards
