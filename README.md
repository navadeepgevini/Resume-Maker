# RESUMEMAKER

A production-ready, guided, step-by-step resume builder that collects a candidate's personal, academic, and professional details through a clean 7-step wizard, then generates a polished, single-page, ATS-friendly resume downloadable as a Word (`.docx`) or PDF (`.pdf`) file.

## ✨ Features

- **Guided 7-Step Wizard**: Collects Personal Details, Links & Coding Profiles, Education, Certifications, Projects, and Skills with smooth back/forward navigation.
- **Live Real-Time Preview**: Split-screen desktop view that re-renders the exact editorial resume layout as you type.
- **One-Page Guarantee**: Live fit indicator and layout auto-adjustment ensure your resume never spills onto a second page.
- **GitHub Import**: Connects to GitHub (`/api/github`) to pull public repositories and import projects with one click.
- **Square Photo Cropper**: Client-side canvas cropping (`react-easy-crop`) for professional 1:1 headshot formatting.
- **ATS-Compliant Document Export**:
  - **Word (`.docx`)**: Generated via `docx` with exact TWIP and point-size typography.
  - **PDF (`.pdf`)**: Native print-ready HTML export matching the exact editorial spec.
- **Privacy First (Guest Mode)**: All work-in-progress data is persisted automatically in your browser's `localStorage` — no account required.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (`@theme` design system tokens)
- **Drag & Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **Document Generation**: `docx` for Word exports
- **Image Processing**: `react-easy-crop` client-side cropping

## 🚀 Getting Started

First, install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start building your resume.

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
npm start
```
