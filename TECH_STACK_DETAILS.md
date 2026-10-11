# SAMAM Platform: In-Depth Technology Stack & Architecture Reference

**Repository:** Mugen-Porta / SAMAM (`KL SAC Activities Platform`)  
**Architecture:** Monorepo with Next.js App Router (Fullstack Serverless/Node.js)  
**Date:** October 2026

---

## 1. High-Level Architectural Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT BROWSER (UI)                                │
│ Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Radix UI Primitives       │
│ Theme Provider (Light/Dark Bento Grid) • Lucide / React-Icons • Sonner Toasts    │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTPS / JSON / SSE
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                          EDGE & GATEWAY LAYER                                    │
│ Edge Middleware (src/middleware.ts): Stateless JWT verification via 'jose'       │
│ Role-Based Access Control: student, club_lead, faculty, admin, super_admin      │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                     BACKEND APPLICATION SERVICES (Next.js Routes)                │
│ ├── Auth & Session Management (Bcryptjs, HttpOnly cookies, RBAC)                │
│ ├── Activity Management & Lifecycle (Creation, Approval, Attendance, SDC)        │
│ ├── AI Intelligence Engine (Google Gemini 3.8 Flash / 3.5 Fallback pipeline)     │
│ ├── Asynchronous Job Queues (BullMQ + Redis Worker)                             │
│ └── Export & Verification Engines (jsPDF, ExcelJS, docx, cryptographic badges)  │
└──────────────────┬─────────────────────┬───────────────────┬─────────────────────┘
                   │                     │                   │
         ┌─────────▼────────┐  ┌─────────▼────────┐  ┌───────▼────────┐
         │     DATABASE     │  │ CACHE & QUEUES   │  │ OBJECT STORAGE │
         │  MySQL (mysql2)  │  │  Redis (ioredis) │  │ Cloudflare R2  │
         │  Connection Pool │  │      BullMQ      │  │     AWS S3     │
         └──────────────────┘  └──────────────────┘  └────────────────┘
```

---

## 2. Core Frontend Framework & UI Engine

| Category | Technology | Version | Purpose & Architecture Context |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js** | `16.0.10` | App Router paradigm, Server & Client Components, Server Actions, Route Handlers, Turbopack bundling |
| **Core UI Engine** | **React & React DOM** | `19.1.0` | Concurrent rendering, `useActionState`, `useOptimistic`, fine-grained transition hooks |
| **Language** | **TypeScript** | `5.7.3` | Strict type definitions across APIs, database schemas, and component interfaces |
| **Styling Engine** | **Tailwind CSS** | `^4.0.0` | Utility-first CSS engine with `@tailwindcss/postcss`, theme variables, and custom crimson palette |
| **Component Primitives** | **Radix UI** | Latest | Unstyled, accessible primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`, `@radix-ui/react-progress`, `@radix-ui/react-switch`, `@radix-ui/react-avatar`, `@radix-ui/react-scroll-area`) |
| **Iconography** | **Lucide React** & **React Icons** | `^0.546.0` & `^5.5.0` | High-density SVG icons, Feather (`fi`), FontAwesome (`fa6`), Lucide |
| **Notifications** | **Sonner** & **React Hot Toast** | `^2.0.7` & `^2.6.0` | Accessible stacked toast notifications with action buttons |
| **Class Utilities** | `clsx`, `tailwind-merge`, `cva` | Latest | Conditional styling and conflict resolution (`cn` helper pattern) |
| **Animation Utilities** | `tailwindcss-animate` | `^1.0.7` | Keyframe entrance, exit, and accordion collapse transitions |

---

## 3. Artificial Intelligence Engine

* **SDK:** `@google/genai` (`^0.1.3`) & `@google/generative-ai` (`^0.24.1`)
* **Primary Model:** **`gemini-3.8-flash`** (High-throughput, ultra-low latency, multimodal reasoning)
* **Fallback Cascade:**
  1. `gemini-3.8-flash` (Primary Production)
  2. `gemini-2.5-flash` / `gemini-2.0-flash`
  3. `gemini-1.5-flash` / `gemini-1.5-pro`
  4. `gemini-3.5-lite` / `gemini-2.5-lite`
* **Use Cases:**
  * **AI Career Pathway Matcher:** Analyzes earned competencies across domains (`TEC`, `LCH`, `ESO`, `IIE`, `HWB`) and matches industry career targets.
  * **Activity Content Assistant:** Automated generation of competencies, UN SDG mappings, and learning outcomes for club leads.
  * **Personalized Student Recommendations:** Contextual recommendations based on current SDC milestone and graduate attribute gaps.

---

## 4. Backend & API Layer

* **Route Handlers:** Next.js `/api/...` endpoints executing on Node.js runtime.
* **Authentication & Session:**
  * **`jose`** (`^6.1.0`): Lightweight Web Cryptography API compliant JWT signing and verification inside Next.js Edge Middleware.
  * **`bcryptjs`** (`^3.0.3`): Salted password hashing for credentials.
  * **Cookies:** Secure, `HttpOnly`, `SameSite=Lax` cookies prevent XSS credential exfiltration.
* **Role-Based Access Control (RBAC):**
  * `student`: SDC tracking, activity registration, badge issuance, digital certificates.
  * `club_lead`: Activity proposal submission, attendance tracking, member allotment.
  * `faculty`: Proposal review, club mentor sign-off, attendance verification.
  * `admin` / `council`: Central activity approvals, venue booking clash checks, budget oversight.
  * `analytics`: Institutional metric reports (IQAC, NAAC, NBA compliance).
  * `super_admin`: System settings, role assignments, audit logs.

---

## 5. Persistence, Caching & Data Layer

* **Relational Database:** **MySQL**
  * Client: **`mysql2`** (`^3.15.0`) with promise-based connection pool.
  * Schema Strategy: Relational tables (`activity_catalogue`, `users`, `attendance_records`, `badges`, etc.) with JSON columns for flexible metadata (`outcomes`, `competencies`, `sdgs`, `ga`).
  * Concurrency: Upsert patterns using `ON DUPLICATE KEY UPDATE`.
* **Caching & Asynchronous Queues:**
  * **Redis (`ioredis` `^5.6.1`):** In-memory session cache, rate-limiting, and temporary attendance OTP store.
  * **BullMQ (`^5.45.9`):** Distributed background jobs for badge minting, bulk email notifications, and certificate generation.
* **Object Storage:**
  * **Cloudflare R2 / AWS S3 (`@aws-sdk/client-s3` `^3.832.0`):** Secure storage of club banners, activity proof attachments, and student profile images.

---

## 6. Document Generation & Digital Credentials

* **PDF Reports:** **`jspdf`** (`^4.2.0`) & **`jspdf-autotable`** (`^5.0.7`) for official SDC transcripts, student certificates, and attendance rosters.
* **Office Documents:** **`docx`** (`^9.5.1`) for formal administrative circulars and event proposals.
* **Spreadsheets:** **`exceljs`** (`^4.4.0`) for high-volume tabular audit exports for NAAC/NBA criteria.
* **Cryptographic QR Badges:** **`qrcode`** (`^1.5.4`) for tamper-evident digital certificate verification links.

---

## 7. Development, Quality Assurance & Tooling

* **Package Manager:** `npm` / `bun` compatible.
* **Linting & Code Quality:** ESLint with `eslint-config-next` (`16.0.10`).
* **Typechecking:** TypeScript compiler (`tsc --noEmit`).
* **Environment Configurations:** Dotenv / Next.js `.env.local` with strict environment variable isolation.
