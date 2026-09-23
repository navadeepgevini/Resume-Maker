export interface PersonalDetails {
  fullName: string;
  headline: string;
  phone: string;
  email: string;
  cityState: string;
  dateOfBirth: string;
  showDOB: boolean;
  photo: string; // base64 data URI or empty string
  showPhoto: boolean;
}

export interface LinksAndProfiles {
  linkedin: string;
  github: string;
  leetcode: string;
  codeforces: string;
  hackerrank: string;
  personalSite: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  startYear: string;
  endYear: string; // or "Present"
  gradeType: 'cgpa' | 'percentage';
  gradeValue: string;
}

export interface CertificationEntry {
  id: string;
  title: string;
  issuer: string;
  completionDate: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  techStack: string[];
  bullets: string[];
  repoLink: string;
  liveLink: string;
  featured: boolean;
  importedFromGitHub: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export type ResumeTemplate = 'classic' | 'modern' | 'bold';

export interface ResumeSettings {
  pageSize: 'letter' | 'a4';
  showPhoto: boolean;
  template: ResumeTemplate;
}

export interface ResumeData {
  personal: PersonalDetails;
  links: LinksAndProfiles;
  education: EducationEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  skills: SkillCategory[];
  settings: ResumeSettings;
  targetJobDescription?: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  pushed_at: string;
  html_url: string;
}

// For one-page enforcement
export interface FitCheckResult {
  fits: boolean;
  suggestions: string[];
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Personal',
  2: 'Links',
  3: 'Education',
  4: 'Certifications',
  5: 'Projects',
  6: 'Skills',
  7: 'Review',
};
