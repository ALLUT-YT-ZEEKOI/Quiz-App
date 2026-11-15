# QSAP – Premium Civil Engineering Learning & Assessment Platform

**Client:** Adithyan  
**Project:** QSAP (Quantitative Surveying & Academic Performance Platform)  
**Technology:** React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti  
**Standards Embedded:** IS 456:2000, IS 800:2007, IS 10262:2019, IS 1077, IRC:73, CPHEEO  

---

## 🏗️ Overview

**QSAP** is a commercial-grade, mobile-responsive web application designed specifically for **Civil Engineering Departments, Universities, and Engineering Colleges**. It unifies learning, timed examination delivery, question banking, and comprehensive student performance analytics into a cohesive enterprise SaaS experience.

---

## ✨ Key Features & Architecture

### 1. 🎨 Enterprise UI/UX Design System
- **Color Palette:**
  - **Primary:** Deep Navy Blue (`#101D35`)
  - **Secondary / Brand:** Royal Blue (`#2563EB`)
  - **Surface Background:** Light Slate (`#F8FAFC`) / Dark Mode (`#0B1120`)
  - **Card Containers:** Pure White (`#FFFFFF`) / Dark Mode Card (`#151E32`)
  - **Success:** Emerald Green (`#10B981`)
  - **Warning:** Amber (`#F59E0B`)
  - **Danger / Remedial:** Ruby Red (`#EF4444`)
- **Typography:** Plus Jakarta Sans & Inter font hierarchy.
- **Micro-Interactions:** Smooth transitions, responsive slide-over drawer navigation, toast notifications, and interactive question palettes.
- **Theme Support:** Dark / Light mode toggle with persistent state.

### 2. 🔐 Authentication & Instant Demo Role Switcher
- **Demo Role Switching:** Switch between **Teacher (Dr. Rajesh Sharma, HOD)** and **Student (Adithyan S.)** with a single click in the top navigation bar.
- **Interactive Login Modal:** Includes dedicated tabs for Faculty and Students with 1-click test credentials and simulated password recovery.
- **State Persistence:** All actions (adding students, modifying quizzes, creating questions, taking exams) are persisted in `localStorage`. Includes a one-click **"Reset Demo Data"** action.

---

### 3. 👨‍🏫 Teacher / Faculty Portal

#### A. Teacher Dashboard & Analytics
- **8 KPI Metrics:** Total Students (20), Active Courses (10), Total Quizzes (10), Total Questions (100+), Completed Assessments, Average Student Score (81.4%), Pass Percentage (89.2%), Pending Submissions (6).
- **Interactive Bar Charts:** Subject-wise performance tracking across all 10 Civil disciplines against the 75% departmental benchmark.
- **Grade Distribution:** Breakdown across Distinction (≥90%), First Class (75–89%), Second Class (60–74%), and Remedial (<60%).
- **Recent Student Submissions:** Live audit table with one-click **"Review"** answers modal.
- **Quick Actions:** Create Quiz, Add Question, Register Student, Export CSV.

#### B. Student Directory & Profile Management
- **Directory Table & Mobile Cards:** Comprehensive records for 20 Civil Engineering students across Semesters S2, S4, S6, S8 and Batches 2021–2025 through 2024–2028.
- **Multi-parameter Filters:** Search by Name/ID, Semester, Batch, and Academic Status.
- **Detailed Student Profile Sheet:**
  - Personal & contact info
  - Attendance rate gauge (exam eligibility check)
  - Cumulative CGPA
  - 10-Subject curriculum mastery progress bars
  - Complete history of verified quiz attempts
- **Actions:** Add Student, Edit Details, Delete with safety confirmation, and **Export CSV**.

#### C. Civil Engineering Question Bank (100+ Questions)
- Curated repository of **100 technically rigorous Civil Engineering questions** (10 per subject) with accurate options, correct keys, and comprehensive technical explanations referencing IS codes.
- **Features:**
  - Filter by Subject and Difficulty (Easy, Medium, Hard).
  - Add New Question modal with 4 options, key selector, and live validation.
  - Preview Question modal.
  - Edit and Delete operations.

#### D. Quiz Management
- Schedule and configure timed examinations.
- **Features:**
  - Set title, subject, duration (minutes), total marks, passing cutoff %, allowed attempts.
  - Multi-select question picker from Question Bank.
  - **Live Publish/Unpublish toggle:** Unpublished quizzes are immediately hidden from the student portal.
  - Edit and Delete quizzes.

#### E. Assessment Results & Answer Audit
- Grade audit table with filtering by quiz, subject, and status (Passed/Failed).
- **Detailed Answer Review Modal:** Question-by-question inspection of student's choice vs official answer key with technical explanations.
- **Export Results CSV:** Download complete institutional assessment logs.

---

### 4. 🎓 Student Portal

#### A. Student Dashboard
- Personalized greeting for **Adithyan S.** (S6 Civil Engineering).
- Academic summary: Enrolled Courses (10), Available Quizzes, Completed Tests, Current Average Score, Exam Hall Attendance Permit.
- **Recommended Assessments:** One-click launch for upcoming and syllabus-aligned tests.
- **Subject Mastery Progress:** Visual progress bars for core disciplines.

#### B. 10 Civil Engineering Core Disciplines
1. **Structural Analysis (CE 301)** – Castigliano's theorems, slope deflection, moment distribution, ILD.
2. **Surveying (CE 202)** – Reciprocal levelling, curvature & refraction, Bowditch rule, Total Station.
3. **Concrete Technology (CE 204)** – Abrams law, Le Chatelier soundness, Bogue compounds, IS 10262:2019 mix design.
4. **Geotechnical Engineering (CE 302)** – Darcy law, Mohr-Coulomb shear, Terzaghi bearing capacity, 1D consolidation.
5. **Building Materials (CE 103)** – IS 1077 brick absorption, Blaine cement fineness, TMT metallurgy, timber.
6. **Estimation & Costing (CE 401)** – Center line deductions, BBS bar bending, rate analysis, depreciation.
7. **Transportation Engineering (CE 305)** – Stopping Sight Distance (SSD), super-elevation, CBR test, Marshall stability.
8. **Fluid Mechanics (CE 201)** – Bernoulli energy conservation, Reynolds laminar flow, Venturimeter, Manning's formula.
9. **RCC Design (CE 304)** – IS 456:2000 limit state design, 0.85bd/fy minimum steel, neutral axis, stirrups.
10. **Environmental Engineering (CE 306)** – BOD5 test kinetics, COD ratio, breakpoint chlorination, Activated Sludge SVI.

#### C. Student Online Examination Interface
- **Distraction-Free Full Exam Screen:**
  - Live animated countdown timer with critical pulsing alert when `< 2 minutes` remain.
  - Automatic submission when time expires.
  - Next, Previous, and Clear Response controls.
  - **Mark for Review** with visual purple tag.
  - **Question Palette (1..10):** Color-coded indicators for Answered (Green), Unanswered (Gray), Marked for Review (Purple), and Current Question (Blue Ring).
  - Safety confirmation modal summarizing answered/unanswered counts before final submission.

#### D. Assessment Result Dashboard
- **Celebratory Confetti Animation** upon passing.
- Large circular score chart with score, percentage, and PASSED / FAILED badge.
- Correct vs Incorrect breakdown metrics.
- **Question-by-Question Detailed Review:**
  - Displays what the student selected (green if correct, red if incorrect).
  - Highlights the official correct key.
  - Full technical Civil Engineering explanation referencing relevant Indian Standards.
- **Retake Assessment** and **Print / Save Result Sheet** (print-optimized CSS).

#### E. Class Leaderboard
- Top ranked civil engineering students sorted by average quiz score and CGPA.
- Podium display with Gold, Silver, Bronze badges for the Top 3.
- Highlights the active student's rank in real time.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended; developed and tested on Node v24)
- **npm** (v9 or higher)

### Installation & Launch

1. Open a terminal in the project directory:
   ```bash
   cd "c:\Web Projects\Quiz App"
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at the URL shown (typically `http://localhost:3000` or `http://localhost:5173`).

### Production Build
To create an optimized production build:
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```

---

## 📂 Project Directory Structure

```
c:\Web Projects\Quiz App\
├── index.html                   # HTML entry point with Plus Jakarta Sans & Inter
├── package.json                 # Dependencies (React 19, Lucide, Tailwind, Confetti)
├── tailwind.config.js           # Theme colors: Navy #101D35, Royal Blue #2563EB, etc.
├── vite.config.js               # Vite bundler configuration
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main view router & shell
│   ├── index.css                # Global Tailwind directives & print styles
│   ├── context/
│   │   └── AppContext.jsx       # State management, role switching, localStorage sync
│   ├── data/
│   │   ├── initialData.js       # 20 Students, 3 Teachers, 10 Subjects
│   │   ├── questionsData.js     # 100 technically accurate Civil Engineering questions
│   │   └── quizzesData.js       # 10 Quizzes, sample student attempts, notifications
│   └── components/
│       ├── common/
│       │   ├── Navbar.jsx              # Header with role switcher, search, dark mode
│       │   ├── Sidebar.jsx             # Collapsible responsive navigation drawer
│       │   ├── ToastContainer.jsx      # Non-intrusive notification popups
│       │   └── GlobalSearchModal.jsx   # Ctrl+K quick search across all resources
│       ├── auth/
│       │   └── AuthModal.jsx           # Login portal with 1-click demo logins
│       ├── teacher/
│       │   ├── TeacherDashboard.jsx    # Analytics, KPI cards, performance charts
│       │   ├── StudentDirectory.jsx    # Student management, filters, CSV export
│       │   ├── StudentProfileModal.jsx # Detailed student records & progress
│       │   ├── QuestionBank.jsx        # 100+ questions CRUD & preview
│       │   ├── QuizManagement.jsx      # Examination scheduler & publish toggle
│       │   └── TeacherResults.jsx      # Grade audit & question-by-question review
│       ├── student/
│       │   ├── StudentDashboard.jsx    # Student overview, progress, recommendations
│       │   ├── SubjectDirectory.jsx    # 10 Civil Engineering course cards & topics
│       │   ├── StudentQuizzes.jsx      # Examination listing & start interface
│       │   └── StudentLeaderboard.jsx  # Academic standing & top 3 podium
│       ├── quiz/
│       │   ├── QuizAttemptScreen.jsx   # Timed exam interface with question palette
│       │   └── QuizResultScreen.jsx    # Confetti celebration & answer sheet
│       └── profile/
│           └── ProfileManagement.jsx   # Profile details & password management
```

---

## 💼 Client Presentation Notes

- **Commercial SaaS Polish:** Designed with enterprise design patterns, subtle shadows, rounded pill badges, and no generic template feel.
- **Civil Engineering Relevance:** All questions and subjects feature authentic engineering principles (e.g., Castigliano's theorem, Abrams law, Darcy's law, IS 456 neutral axis depth, CBR testing, BOD kinetics).
- **Responsive Touch Design:** Tested for mobile screens, tablet devices, and widescreen desktops.

#   Q u i z - A p p  
 