'use client';

import { useMemo } from 'react';
import type { ResumeData } from '@/types/resume';

/**
 * Profile Completeness breakdown item
 */
export interface CompletenessItem {
  label: string;
  score: number;      // 0-100 for this category
  maxScore: number;   // weight of this category
  earned: number;     // actual points earned (score * maxScore / 100)
  suggestion?: string;
}

export interface CompletenessResult {
  totalScore: number; // 0-100
  items: CompletenessItem[];
}

/**
 * Compute a deterministic completeness score from resume data.
 * The rubric covers: contact info, links, education, projects, skills, bullet quality, and section balance.
 */
function computeCompletenessScore(data: ResumeData): CompletenessResult {
  const items: CompletenessItem[] = [];

  // ---- 1. Contact Information (20 points) ----
  {
    let score = 0;
    const checks = [
      { val: data.personal.fullName?.trim(), weight: 25 },
      { val: data.personal.email?.trim(), weight: 25 },
      { val: data.personal.phone?.trim(), weight: 25 },
      { val: data.personal.cityState?.trim(), weight: 15 },
      { val: data.personal.headline?.trim(), weight: 10 },
    ];
    for (const c of checks) {
      if (c.val) score += c.weight;
    }
    let suggestion: string | undefined;
    if (!data.personal.fullName?.trim()) suggestion = 'Add your full name';
    else if (!data.personal.email?.trim()) suggestion = 'Add your email address';
    else if (!data.personal.phone?.trim()) suggestion = 'Add your phone number';
    else if (!data.personal.headline?.trim()) suggestion = 'Add a professional headline (e.g., "Full-Stack Developer")';

    items.push({ label: 'Contact Information', score, maxScore: 20, earned: Math.round(score * 20 / 100), suggestion });
  }

  // ---- 2. Professional Links (10 points) ----
  {
    const links = [
      data.links.linkedin,
      data.links.github,
      data.links.personalSite,
      data.links.leetcode,
      data.links.codeforces,
      data.links.hackerrank,
    ].filter(l => l?.trim());

    const score = Math.min(100, links.length * 40); // 1 link = 40, 2 = 80, 3+ = 100
    let suggestion: string | undefined;
    if (links.length === 0) suggestion = 'Add at least one professional link (LinkedIn, GitHub, etc.)';
    else if (links.length === 1) suggestion = 'Add a second professional link for a stronger profile';

    items.push({ label: 'Professional Links', score, maxScore: 10, earned: Math.round(score * 10 / 100), suggestion });
  }

  // ---- 3. Education (15 points) ----
  {
    const validEdu = data.education.filter(e => e.institution?.trim() && e.degree?.trim());
    let score = 0;
    if (validEdu.length >= 1) score += 60;
    if (validEdu.length >= 2) score += 20;
    // Check for complete entries (with years and grade)
    const complete = validEdu.filter(e => e.startYear?.trim() && e.endYear?.trim());
    if (complete.length >= 1) score += 20;

    let suggestion: string | undefined;
    if (validEdu.length === 0) suggestion = 'Add at least one education entry';
    else if (!validEdu[0].startYear?.trim() || !validEdu[0].endYear?.trim()) suggestion = 'Add start/end years to your education entries';

    items.push({ label: 'Education', score: Math.min(100, score), maxScore: 15, earned: Math.round(Math.min(100, score) * 15 / 100), suggestion });
  }

  // ---- 4. Projects / Experience (25 points) — heaviest weight ----
  {
    const featuredProjects = data.projects.filter(p => p.featured && p.name?.trim());
    const allProjects = data.projects.filter(p => p.name?.trim());
    let score = 0;

    // Have projects at all
    if (allProjects.length >= 1) score += 20;
    if (allProjects.length >= 2) score += 15;
    if (allProjects.length >= 3) score += 10;

    // Featured projects
    if (featuredProjects.length >= 2) score += 10;

    // Bullet points quality
    const totalBullets = allProjects.reduce((sum, p) => sum + p.bullets.filter(b => b.trim()).length, 0);
    if (totalBullets >= 3) score += 10;
    if (totalBullets >= 6) score += 10;
    if (totalBullets >= 10) score += 5;

    // Tech stack tags
    const projectsWithTech = allProjects.filter(p => p.techStack.length > 0);
    if (projectsWithTech.length >= 1) score += 10;
    if (projectsWithTech.length >= allProjects.length && allProjects.length > 0) score += 10;

    let suggestion: string | undefined;
    if (allProjects.length === 0) suggestion = 'Add at least 2-3 projects with bullet points';
    else if (totalBullets < 6) suggestion = 'Add more bullet points to your projects (aim for 2-3 per project)';
    else if (projectsWithTech.length < allProjects.length) suggestion = 'Add tech stack tags to all your projects';

    items.push({ label: 'Projects & Experience', score: Math.min(100, score), maxScore: 25, earned: Math.round(Math.min(100, score) * 25 / 100), suggestion });
  }

  // ---- 5. Skills (20 points) ----
  {
    const nonEmptyCategories = data.skills.filter(c => c.skills.length > 0);
    const totalSkills = data.skills.reduce((sum, c) => sum + c.skills.length, 0);

    let score = 0;
    if (nonEmptyCategories.length >= 1) score += 30;
    if (nonEmptyCategories.length >= 2) score += 20;
    if (nonEmptyCategories.length >= 3) score += 15;
    if (totalSkills >= 5) score += 15;
    if (totalSkills >= 10) score += 10;
    if (totalSkills >= 15) score += 10;

    let suggestion: string | undefined;
    if (totalSkills === 0) suggestion = 'Add your technical skills across categories';
    else if (nonEmptyCategories.length < 2) suggestion = 'Add skills in more categories (Languages, Frameworks, Tools)';
    else if (totalSkills < 10) suggestion = 'Add more skills — aim for 10+ relevant skills';

    items.push({ label: 'Skills', score: Math.min(100, score), maxScore: 20, earned: Math.round(Math.min(100, score) * 20 / 100), suggestion });
  }

  // ---- 6. Certifications (10 points — bonus) ----
  {
    const validCerts = data.certifications.filter(c => c.title?.trim());
    let score = 0;
    if (validCerts.length >= 1) score += 50;
    if (validCerts.length >= 2) score += 30;
    if (validCerts.length >= 3) score += 20;

    let suggestion: string | undefined;
    if (validCerts.length === 0) suggestion = 'Add certifications to boost your score';

    items.push({ label: 'Certifications', score: Math.min(100, score), maxScore: 10, earned: Math.round(Math.min(100, score) * 10 / 100), suggestion });
  }

  // ---- Total ----
  const totalScore = items.reduce((sum, item) => sum + item.earned, 0);

  return { totalScore, items };
}

/**
 * Get a color for the score gauge.
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#15803D'; // green
  if (score >= 60) return '#ca8a04'; // amber
  if (score >= 40) return '#ea580c'; // orange
  return '#B91C1C'; // red
}

/**
 * Get a grade label for the score.
 */
function getScoreGrade(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Low';
}

interface ProfileCompletenessWidgetProps {
  data: ResumeData;
}

/**
 * Profile Completeness Widget — displays how completely the user has filled out their profile.
 */
export default function ProfileCompletenessWidget({ data }: ProfileCompletenessWidgetProps) {
  const result = useMemo(() => computeCompletenessScore(data), [data]);
  const color = getScoreColor(result.totalScore);
  const grade = getScoreGrade(result.totalScore);

  // SVG circular gauge params
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (result.totalScore / 100) * circumference;

  const suggestions = result.items
    .filter(item => item.suggestion && item.score < 100)
    .map(item => ({ label: item.label, suggestion: item.suggestion! }));

  return (
    <div className="rounded-[8px] border border-[#E4E4DF] bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E4E4DF] bg-[#FAFAF9]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#33415C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-sm font-semibold text-[#1C1C1A]">Profile Completeness</h3>
        </div>
      </div>

      {/* Score Gauge */}
      <div className="flex flex-col items-center py-5">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="#E4E4DF"
              strokeWidth="8"
            />
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s ease' }}
            />
          </svg>
          {/* Score number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color, fontFamily: 'var(--font-plex-sans)' }}>
              {result.totalScore}
            </span>
            <span className="text-[10px] font-medium text-[#6B6B63] uppercase tracking-wider">
              / 100
            </span>
          </div>
        </div>
        <span
          className="mt-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color }}
        >
          {grade}
        </span>
      </div>

      {/* Score Breakdown */}
      <div className="px-4 pb-3 space-y-2">
        {result.items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#6B6B63]">{item.label}</span>
              <span className="font-medium text-[#1C1C1A]">{item.earned}/{item.maxScore}</span>
            </div>
            <div className="w-full h-1.5 bg-[#E4E4DF] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${item.score}%`,
                  backgroundColor: getScoreColor(item.score),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-[#E4E4DF]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6B63] mb-2">
            Missing Fields
          </p>
          <ul className="space-y-1.5">
            {suggestions.slice(0, 3).map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-[#6B6B63]">
                <svg className="w-3 h-3 mt-0.5 shrink-0 text-[#ca8a04]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{s.suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
