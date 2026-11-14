# College Placement and Career Management Portal (CPCM)

An enterprise-grade, centralized web platform designed to digitize and streamline the campus recruitment lifecycle, connecting **Students**, **Placement Administrators**, and **Company Recruiters**. The portal incorporates an **AI-powered Career Assistance Environment** with semantic resume ATS matching, automated student eligibility filtering, job-specific resume tailoring, interactive mock interviews, real-time Socket.IO notifications, and placement analytics.

---

## 🏛 System Architecture

The project follows a **Modular Monolithic Architecture**:
- **Frontend:** React.js, Vite, Tailwind CSS, Lucide React, Socket.IO client, Axios.
- **Backend:** Node.js, Express.js (Modular Monolith with independent business modules: Auth, Students, Recruiters, Jobs, Eligibility, Applications, Notifications, Alumni, Analytics, AI proxy), Mongoose, Socket.IO.
- **Database:** MongoDB (`mongodb://127.0.0.1:27017/campus_placement_db`).
- **AI Microservice:** Python 3.10, FastAPI, LangChain, HuggingFace Sentence Transformers (`all-MiniLM-L6-v2`), FAISS Vector Database, Google Gemini LLM (with robust heuristic fallback).

---

## 🚀 Key Functional Modules

1. **User Registration & Role-Based Authentication:**
   - Roles: `Student`, `Recruiter`, `Placement Admin`.
   - JWT authentication tokens, bcrypt password hashing, role guard middleware.
   - Quick 1-Click Demo Login buttons for instant evaluation.

2. **Student Profile & Academic Information Management:**
   - Academic qualifications, semester-wise SGPA tracking, cumulative CGPA, active & historical backlogs, technical skill tags, certifications, projects, and internships.
   - Multi-version resume upload (PDF/DOCX) with primary resume assignment.

3. **Company & Job Opportunity Management:**
   - Recruiters publish placement drives with eligible branches, minimum CGPA cutoff, backlog restrictions, salary package (CTC & stipend), selection rounds, and deadlines.

4. **Automated Student Eligibility Filtering:**
   - Evaluates academic criteria (Branch, Graduation Batch, CGPA, Active Backlogs, 10th/12th percentages) in real-time.
   - Displays real-time eligibility badges (Green `Eligible` or Red `Not Eligible` with complete modal audit reasons).
   - Placement administrators can inspect the entire eligible vs ineligible student pool for any opening with 1 click.

5. **Application Lifecycle & Tracking:**
   - Prevents duplicate applications and enforces deadline and eligibility checks.
   - Transparent stages: `Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Assessment` ➔ `Interview` ➔ `Selected` / `Rejected`.
   - Recruiter interview scheduling with datetime, virtual meeting links, and interviewer feedback.

6. **AI-Powered ATS Resume Analysis (LangChain + FAISS + Gemini):**
   - Extracts text from uploaded PDF/DOCX resumes.
   - LangChain character text splitting and HuggingFace semantic vector embeddings.
   - FAISS semantic retrieval to match resume excerpts against job requirements.
   - Generates overall ATS match score, skills alignment %, identified skill gaps, missing requirements, and actionable bullet-point recommendations.

7. **AI-Powered Job-Specific Resume Tailoring:**
   - Synthesizes student's genuine experience with employer requirements.
   - Generates tailored professional summaries, action-verb project descriptions, prioritized skills, and ATS formatting advice.

8. **AI-Powered Mock Interview Simulator:**
   - Technical and behavioral question generation tailored by role and domain.
   - Student answer submission with AI scoring (1-10) across technical correctness, clarity, completeness, missing concepts, and exemplary model answers.

9. **Real-Time Notifications (Socket.IO):**
   - Instant live delivery of job alerts, shortlisting decisions, interview schedules, and administrator broadcasts without page refresh.

10. **Alumni Feedback & Career Guidance:**
    - Placed graduates share interview rounds, company tips, actual interview questions asked, and upvotes.

11. **Placement Analytics & Reporting:**
    - Placed vs unplaced metrics, department placement rates, salary CTC ranges (highest, average), and in-demand technical skills.

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Placement Admin** | `admin@campus.edu` | `password123` | Institutional Command Center & Analytics |
| **Company Recruiter** | `recruiter@google.com` | `password123` | Google Campus Hiring Lead |
| **Company Recruiter** | `recruiter@microsoft.com` | `password123` | Microsoft Talent Acquisition |
| **Student** | `student@campus.edu` | `password123` | CSE Student, CGPA 8.85, 0 Backlogs |

*(Or click the 1-Click Demo buttons on the Login page)*

---

## 🛠 Running the Project

### Option A: 1-Click Startup (Windows)
Double-click `start-all.bat` in the root folder, which starts all three services in parallel.

### Option B: Manual Terminal Execution

#### 1. AI FastAPI Service
```bash
cd "d:\campus placement\ai-service"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Node.js Express Backend
```bash
cd "d:\campus placement\backend"
npm start
```
*Backend runs on `http://localhost:5000` and seeds initial placement data.*

#### 3. React Vite Frontend
```bash
cd "d:\campus placement\frontend"
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📂 Directory Layout

```
d:\campus placement\
├── backend/                  # Node.js + Express.js + Socket.IO + Mongoose
│   ├── src/
│   │   ├── config/           # MongoDB and Socket.IO configurations
│   │   ├── middleware/       # JWT auth & Multer file uploads
│   │   ├── modules/          # auth, students, recruiters, jobs, eligibility,
│   │   │                     # applications, notifications, alumni, analytics, ai
│   │   └── utils/seedData.js # Pre-populated realistic campus demo data
│   ├── server.js             # Express application entry point
│   └── uploads/              # Storage directory for candidate resumes
├── ai-service/               # Python + FastAPI + LangChain AI Microservice
│   ├── services/
│   │   ├── document_processor.py # PDF/DOCX text extraction & chunking
│   │   ├── rag_engine.py         # FAISS vector store & SentenceTransformers
│   │   ├── ats_analyzer.py       # RAG ATS scoring & gap evaluation
│   │   ├── resume_improver.py    # Job-tailored resume generation
│   │   └── mock_interview.py     # Interview question generator & evaluator
│   └── main.py               # FastAPI server endpoints
├── frontend/                 # React.js + Vite + Tailwind CSS
│   └── src/
│       ├── context/          # AuthContext & NotificationContext (Socket.IO)
│       ├── components/       # Navbar, NotificationDropdown, EligibilityBadge, Toast
│       ├── pages/
│       │   ├── auth/         # Login & Register with 1-click demo accounts
│       │   ├── student/      # Dashboard, Profile, JobBrowse, ATSAnalyzer,
│       │   │                 # ResumeImprover, MockInterview, Applications, Alumni
│       │   ├── recruiter/    # Dashboard, PostJob, ManageJobs, ApplicantReview
│       │   └── admin/        # CommandCenter, StudentDirectory, JobAudit, Analytics
│       └── App.jsx           # Role router & main layout
└── start-all.bat             # Convenience batch script to launch all 3 servers
```
