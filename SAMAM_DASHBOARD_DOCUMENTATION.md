# SAMAM (Student Activity Management & Monitoring) Dashboard Documentation
**Platform:** Mugen-Porta / KL SAC Activities Platform  
**Target Audience:** Students, Club Leads, Faculty Mentors, Council Heads, Analytics Officers, Super Admins  

---

## 1. Executive Summary & System Overview

**SAMAM** (*Student Activity Management and Monitoring*) is an enterprise student engagement, skill validation, and accreditation portal built for the **Student Activity Center (SAC)** at **KL University**.

The platform is organized around 5 foundational activity domains:
* **TEC:** Technology & Emerging Technologies
* **LCH:** Liberal Arts, Culture and Heritage
* **ESO:** Extension & Social Outreach
* **IIE:** Innovation & Entrepreneurship
* **HWB:** Health & Well-being

Students progress through 6 structured journey levels based on earned **SAMAM Points**:
1. **Explorer** (0 pts)
2. **Foundation** (500 pts)
3. **Practitioner** (1,250 pts)
4. **Leader** (2,000 pts)
5. **Innovator** (3,000 pts)
6. **Fellow** (4,500 pts)

All activities align directly with:
* The 17 **UN Sustainable Development Goals (SDGs)**
* Institutional **Graduate Attributes (GA)** (e.g., Critical Thinking, Engineering Excellence, Digital Competence, Lifelong Learning)
* **IQAC / NAAC / NBA** institutional compliance audits

---

## 2. Complete Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SAMAM TECHNOLOGY STACK                          │
├────────────────────────────────────────────────────────────────────────┤
│ FRONTEND           │ Next.js 16 (App Router), React 19, TypeScript 5.7  │
│ STYLING & UI       │ Tailwind CSS v4, Radix UI Primitives, Lucide/Icons│
│ AI ENGINE          │ Google Gemini (3.8 Flash / Latest / 3.5 Lite)      │
│ BACKEND / API      │ Next.js Route Handlers (Edge Middleware + Node.js) │
│ DATABASE           │ MySQL (mysql2 pool with zero-downtime migrations)  │
│ QUEUE & CACHE      │ Redis (ioredis) + BullMQ (Asynchronous jobs)       │
│ OBJECT STORAGE     │ Cloudflare R2 / AWS S3 (@aws-sdk/client-s3)        │
│ EXPORTS / REPORTS  │ jsPDF, jspdf-autotable, docx, ExcelJS, QRCode      │
│ AUTH & SECURITY    │ Jose (Stateless JWT in HttpOnly cookie), Bcryptjs  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Frontend & User Interface
* **Framework:** **Next.js 16.0.10** with React Compiler / Turbopack support.
* **Component Engine:** **React 19.1.0** & **React DOM 19.1.0**.
* **Type System:** **TypeScript 5.7.3** providing strict end-to-end typing for database queries, API contracts, and component props.
* **CSS & Design System:**
  * **Tailwind CSS v4** (`@tailwindcss/postcss`) with custom institutional branding (`rgb(151, 0, 3)` / Crimson `#970003`).
  * **Radix UI Primitives:** Accessible, headless primitives for Dialogs, Dropdown Menus, Popovers, Tabs, Tooltips, Progress bars, Switches, and Selects.
  * **Iconography:** `lucide-react` (0.546.0) and `react-icons` (5.5.0 - Feather & FontAwesome icon sets).
  * **Toasts & Feedback:** `sonner` and `react-hot-toast`.
  * **Styling Utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`, `tailwindcss-animate`.

### 2.2 Artificial Intelligence & Machine Learning
* **Provider:** **Google Generative AI (`@google/generative-ai`)**.
* **Tiered Fallback Pipeline (`src/lib/gemini.ts`):**
  1. `gemini-3.8-flash` (Primary reasoning model for career matching and roadmap generation)
  2. `gemini-flash-latest` (Secondary high-intelligence tier)
  3. `gemini-3.5-flash-lite` (Fast execution tier if main servers experience peak traffic)
  4. `gemini-3.1-flash-lite` (Resilience safety net)
* **Multi-Key Load Balancing:** Cycles through multiple `GEMINI_API_KEY*` environment keys upon detecting `429` (Rate Limit) or `403` errors.
* **Structured Output Mode:** Enforces `application/json` output schemas with fail-safe JSON recovery parsing.
* **Usage & Token Tracking:** Logs all token spending to the database table `ai_usage_log`.

### 2.3 Backend & Database Architecture
* **API Architecture:** Serverless and Node.js Next.js App Router Route Handlers (`src/app/api/**`).
* **Relational Database:** **MySQL** running over connection pools (`mysql2/promise`) with single-statement safety, parameterized placeholders, and 5-minute keep-alive timeouts.
* **Zero-Downtime Database Migrations (`src/lib/dbMigrate.ts`):** In-process startup schema verification that dynamically adds missing columns/tables without requiring manual database downtime.
* **Background Worker & Task Queue:** **Redis (`ioredis`)** and **BullMQ** for asynchronous tasks such as transactional email dispatch.
* **File & Object Storage:** **Cloudflare R2 / AWS S3 (`@aws-sdk/client-s3`)** storing posters, task assignment submissions, signed permission letters, photo galleries, and report attachments.

### 2.4 Document Generation, Analytics & Visualizations
* **PDF Generation:** **jsPDF** and **`jspdf-autotable`** for generating client-side and server-side certificates, institutional IQAC compliance reports, and SAC activity documentation.
* **Spreadsheets & Documents:** **ExcelJS** for multi-sheet attendance logs and **docx** for document generation.
* **Charts & Visualizations:** **Recharts** and custom SVG-based radar/ring progress widgets.
* **Verification & QR Codes:** **`qrcode`** library generating verifiable digital credentials linked to public verification routes.

### 2.5 Security & Authentication
* **Session Management:** Stateless JSON Web Tokens (**Jose `jose`** library) signed and stored inside an `HttpOnly`, `SameSite=Lax` cookie named `tck`.
* **Password Security:** **Bcrypt (`bcryptjs` / `bcrypt`)** salted hashing.
* **Edge Route Guards:** `src/middleware.ts` routes and isolates user roles, intercepting unauthorized access and routing users to their respective home dashboards.
* **API Audit Interceptor:** Asynchronous audit trail recording mutations (`/api/internal/log` -> `user_logs`) logging timestamps, usernames, roles, HTTP verbs, and URLs.
* **Impersonation / Proxy Architecture:** Secure proxy session system allowing Admins and Club Leads to view the portal as a student while maintaining an escape hatch back to their primary session.

---

## 3. Student Dashboard (Detailed Feature & Page Breakdown)

The student experience is the central focus of SAMAM. It provides an end-to-end interface for activity participation, portfolio building, and career readiness.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STUDENT DASHBOARD MAP                           │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ CORE ENGAGEMENT   │ CREDENTIALS       │ CAREER & REFLECTION            │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ • Overview        │ • Badge Wallet    │ • AI Career Dashboard          │
│ • Catalogue       │ • Certificates    │ • AI Career Roadmap            │
│ • My Activities   │ • Excellence      │ • Reflection Journal           │
│ • SAMAM Points    │   Passport        │ • Club Affiliation             │
│ • Competencies    │ • Notifications   │ • Music Preference (LCH03)     │
│ • Learning Journey│ • Analytics       │ • Profile & Security           │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### 3.1 Main Dashboard Overview (`/dashboard/student`)
* **Dynamic Hero Header:** Timezone-aware greetings (Morning, Afternoon, Evening, Keep Hustling!), avatar upload preview, degree branch, academic year, and club affiliation.
* **Level Progress Visualizer:** Shows the current tier (Explorer, Foundation, Practitioner, Leader, Innovator, Fellow) with an animated percentage bar displaying progress toward the next milestone.
* **Points Target Gauge:** SAMAM Points earned versus required graduation thresholds.
* **Core KPI Metrics:** 4 summary cards covering Total Points, Badges Earned, Competencies Unlocked, and Current Journey Level.
* **Interactive Competency Radar:** SVG radar chart illustrating proficiency across top skills alongside vertical progress meters.
* **Badge Showcase:** Visual grid showing the student's 6 most recent digital badges.
* **Quick Navigation Strip:** Direct shortcuts to Catalogue, My Activities, Passport, Certificates, and Career tools.
* **Access Control Gate:** Blocks interface rendering if `samam_access !== 1`, displaying instructions to contact administrators.

### 3.2 Activity Catalogue (`/dashboard/student/activity-catalogue` & `/[code]`)
* **Search & Filter Suite:**
  * Keyword search across activity names, codes, and descriptions.
  * Domain filters: Technology (TEC), Liberal Arts (LCH), Social Outreach (ESO), Innovation (IIE), Health & Well-being (HWB).
  * Difficulty filters: Beginner, Intermediate, Advanced.
  * SDG filters: Filter by specific United Nations Goals (1 through 17).
  * Sorting options: Recommended, Name (A–Z), Highest Points, Seats Remaining.
  * Toggle between Grid View and List View with pagination (24 activities/page).
* **Activity Detail View (`/[code]`):**
  * **Hero Banner:** Status indicator, date, start/end time, venue, points value, and seat capacity progress bar.
  * **Tab 1 - Overview:** Full syllabus, learning outcomes, mapped competencies, SDGs, and Graduate Attributes (GA).
  * **Tab 2 - Resources:** External links, study guides, video resources, and documentation uploaded by instructors.
  * **Tab 3 - Tasks / Assignments:** Actionable deliverables with countdown timers (`TaskTimer`), Cloudflare R2 file uploads, submission statuses (Pending, Approved, Rejected), and review comments.
  * **Tab 4 - Attendance:** Live session attendance status (Present / Absent) as verified by club leads.
  * **Tab 5 - Discussion Forum:** Community message board for interacting with peers and organizers.
  * **Tab 6 - Reflection:** Direct link to create a reflective journal entry for the activity.

### 3.3 My Activities (`/dashboard/student/my-activities`)
* **Ongoing Tab:** Real-time directory of enrolled upcoming activities with schedule badges, venue info, and pending task indicators.
* **Completed Tab:** Archive of completed activities showing verified attendance, points credited, and earned credentials.

### 3.4 Learning Journey (`/dashboard/student/learning-journey`)
* **Journey Milestone Visualizer:** Interactive roadmap tracking student advancement through the 6 SAMAM levels:
  * *Explorer* (0 pts)
  * *Foundation* (500 pts)
  * *Practitioner* (1,250 pts)
  * *Leader* (2,000 pts)
  * *Innovator* (3,000 pts)
  * *Fellow* (4,500 pts)
* **Gap Calculation:** Displays the exact points delta required to reach the next tier along with recommended activities to bridge the gap.

### 3.5 Competencies Profile (`/dashboard/student/competencies`)
* **7 Competency Dimensions:** Technical, Professional, Leadership, Research, Innovation, Social, Personal.
* **Proficiency Scales:** Scores scale across Explorer (20) → Foundation (40) → Practitioner (60) → Leader (75) → Mentor (90) → Innovator (100).
* **Evidence Traceability:** Clickable references linking each competency score to the specific activity or badge that validated it.
* **Skill Gap Identification:** Flags untouched competency areas and provides catalogue recommendations.

### 3.6 SAMAM Points (`/dashboard/student/sdc`)
* **Graduation Points Radial Progress:** Radial visualizer comparing accumulated SAMAM Points to graduation requirements.
* **Domain Distribution Bar Chart:** Visual breakdown of points across the 5 domains (TEC, LCH, ESO, IIE, HWB).
* **Points Ledger:** Chronological record of points transactions with activity code references and approval timestamps.

### 3.7 Digital Badge Wallet (`/dashboard/student/badges`)
* **Earned vs. Locked Badges:** Visual gallery of earned badges alongside locked achievements detailing missing prerequisites.
* **Cryptographic Verification:** Each badge includes a unique verification identifier linking to the public route `/badges/verify/[verificationId]`.
* **Credential Export:** Client-side vector (SVG) and high-resolution PNG generation with embedded metadata and XML-safe escaping.
* **One-Click LinkedIn Share:** Pre-populated LinkedIn post generator including skill tags, issuing authority details, and public verification links.

### 3.8 Excellence Passport (`/dashboard/student/passport` & `/passport/[username]`)
* **9-Section Digital Portfolio:** About, Academic, Projects, Internships, Research, Leadership, Community, Achievements, Timeline.
* **Verification Workflow:** Multi-stage review pipeline audited by Faculty Mentors and Admins.
* **Public Visibility Toggle:** Allows students to share their verified portfolio with recruiters via `/passport/[username]`.

### 3.9 AI Career Dashboard (`/dashboard/student/career`)
* **AI Role Matcher (Gemini 3.8 Flash):** Evaluates active student competencies to calculate compatibility with industry roles. Outputs match percentages, rationale, strengths, and areas for growth.
* **Custom Role Fit Checker:** Students can test their readiness for any arbitrary job title with actionable improvement plans.

### 3.10 AI Career Roadmap (`/dashboard/student/career-roadmap`)
* **Personalized Assessment Survey:** CliftonStrengths and MBTI personality profiling combined with career targets.
* **Dynamic Multi-Stage Roadmap:** Produces a phased roadmap with categorized milestones, priority badges, and difficulty ratings.

### 3.11 Reflection Journal (`/dashboard/student/journal`)
* **Reflective Learning Tool:** Mood tracking (Energised, Reflective, Challenged, Growing, Excited, Calm) and activity-linked prompts.

### 3.12 Certificates Hub (`/dashboard/student/certificates`)
* **Verifiable PDF Certificates:** Digital certificates issued upon activity completion with official seals, signatures, and QR codes.

---

## 4. Other Roles

* **Admin Dashboard (`/dashboard/admin`):** Full control over users, clubs, student directory, activity approvals, completed activities, attendance records, passport approvals, Super Analytics, dev tools, and IQAC reporting.
* **Faculty Dashboard (`/dashboard/faculty`):** Scoped oversight for assigned clubs, student rosters, attendance auditing, and passport approvals.
* **Club Lead Dashboard (`/dashboard/lead`):** Activity creation, live attendance marking, task review, and multi-page official SAC Activity Report PDF generator.
* **Analytics Dashboard (`/dashboard/analytics`):** Campus-wide engagement statistics, domain distribution, and exportable PDF summaries.
* **Council Dashboard (`/dashboard/council`):** Domain-level governance, student rosters, activity awards, and access gating.
* **Transport Role:** Event timings, venues, and student bus-route logistics.
* **Public Verification Portals:** Public badge verification (`/badges/verify/[id]`), certificate verification (`/certificates/verify/[id]`), and public student passports (`/passport/[username]`).
