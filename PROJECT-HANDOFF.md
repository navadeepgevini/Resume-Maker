# RESUMEMAKER — Project Handoff & Reboot Script

**Last Updated:** 2026-09-23
**Project Context:** Resume Builder (Next.js 16.2.10, React, TypeScript, Tailwind, Firebase)

> **Prompt to start a new chat:**
> "Read the `PROJECT-HANDOFF.md` file in the root of the project to understand the current state, architecture, and pending tasks. Then continue from **Section 4: Next Steps & Pending Work**."

---

## 1. Project Overview & Tech Stack
RESUMEMAKER is an AI-powered resume building application. 
- **Frontend:** Next.js (App Router, Turbopack), React, Tailwind CSS.
- **Backend/Database:** Firebase (Firestore, Auth, Storage).
- **AI Integrations:** Gemini (Parsing), Groq (Generation APIs), Jev / TypeSafe AI (Low-latency routing/decisions).
- **Agent Ecosystem:** Everything Claude Code (ECC) is installed locally in `.agents/` and `.opencode/skills/` for Antigravity workspaces.

## 2. Completed Milestones & Current Architecture

### Multi-Resume Architecture (Recently Completed)
- **Database Structure:** Upgraded from a single-resume system to a multi-resume structure. Resumes are now saved in Firestore at `users/{userId}/resumes/{resumeId}`.
- **Legacy Auto-Migration:** Logic is in place in `ResumeContext.tsx` to automatically migrate legacy users (who had data saved at `resumes/{userId}`) to the new subcollection upon login without data loss.
- **Dynamic Routing:** The builder route was refactored from `/builder` to `/builder/[id]`.
- **User Dashboard (`/dashboard`):** A centralized hub where logged-in users can view all their past resumes as cards, edit them, delete them, or spin up new blank resumes.
- **Routing Overhaul:** `page.tsx`, `login/page.tsx`, `FileDropZone.tsx`, and `ATSCheckerModal.tsx` were updated to correctly route to `/dashboard` (for logged-in users) or `/builder/default` (for guests).

### Admin & Analytics 
- **Activity Logging:** Implemented in `src/lib/activity-logger.ts` and `activity-logger-server.ts`. Logs user actions (logins, parses, ATS checks) to Firebase.
- **Admin Dashboard (`/admin`):** A secure view to monitor user activity, see who is logging in, and inspect resume JSON snapshots. Protected by `NEXT_PUBLIC_ADMIN_EMAILS` (e.g., `navad@example.com`, `admin@example.com`).

### AI Ecosystem Additions
- **ECC (Everything Claude Code):** Full Antigravity profile installed in `.agents/`.
- **Jev (TypeSafe AI):** Installed `@typesafe-ai/sdk`, configured `TYPESAFE_API_KEY` in `.env.local`, and created `.opencode/skills/jev/SKILL.md` to support fast boolean triaging and decision routing.

## 3. Key Files to Know
- `src/context/ResumeContext.tsx`: Core state management, auto-save debounce, and legacy migration logic.
- `src/app/dashboard/page.tsx`: The new multi-resume management hub.
- `src/app/builder/[id]/page.tsx`: The dynamic builder interface.
- `src/app/admin/page.tsx`: The Admin analytics dashboard.
- `src/lib/firebase.ts`: Firebase initialization and config.
- `.env.local`: Contains Firebase keys, Gemini/Groq API keys, Admin emails, and TypeSafe API Key.

## 4. Next Steps & Pending Work (Start Here)

When resuming development, these are the outstanding features requested by the user:

1. **Persistent "Chatbot" Interface:**
   - **Goal:** Develop an interface (like Flash Conversations) alongside or within the builder.
   - **Details:** Allow users to use chat to sequentially build or modify their resume (e.g., generating bullet points interactively) and pick up where they left off later.
2. **ATS Scoring Engine Overhaul:**
   - **Goal:** Fix the current ATS scorer (which superficially scores 100/100 based on mere *field completeness*).
   - **Details:** Rebuild the scorer to evaluate actual ATS compatibility dimensions: **Parseability** (fonts, layout), **Keyword Match** (against a job description), and **Formatting** (action verbs, quantifiable metrics). Turn it into an actionable tool.
3. **Rich Text Editor Support:**
   - **Goal:** Add formatting capabilities (bold, italics, links) for project/experience bullet points instead of plain text.
4. **Production Deployment:**
   - **Goal:** Prepare the application for live production deployment (e.g., Vercel or Firebase Hosting).
5. **Jev (TypeSafe AI) Implementation:**
   - **Goal:** Utilize the newly installed Jev engine to route decisions (e.g., boolean triage for uploaded files or fast initial ATS checks).
