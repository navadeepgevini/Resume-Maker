import type { ResumeData } from '@/types/resume';
import type { ATSCompatibilityResult, ATSCategoryResult, ATSFailedCheck } from '@/types/ats';

/**
 * Utility to count total pages roughly based on characters.
 * Not perfect, but a reasonable proxy for ATS scoring without actual DOM measurement.
 */
function computedPageCount(resume: ResumeData): number {
  let charCount = 0;
  
  charCount += (resume.personal.fullName || '').length;
  charCount += (resume.personal.headline || '').length;
  charCount += (resume.personal.cityState || '').length;
  charCount += (resume.personal.email || '').length;
  
  resume.education.forEach(e => {
    charCount += (e.institution || '').length + (e.degree || '').length;
  });

  resume.projects.forEach(p => {
    charCount += (p.name || '').length + p.techStack.join(' ').length;
    p.bullets.forEach(b => charCount += b.length);
  });
  
  resume.skills.forEach(c => {
    c.skills.forEach(s => charCount += s.length);
  });
  
  // Roughly 3000-4000 chars per page depending on template and margins
  return Math.ceil(charCount / 3500); 
}

function isValidEmail(email?: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone?: string): boolean {
  if (!phone) return false;
  // Basic check for digits, +, -, spaces, ()
  return /^[\d\s\+\-\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function checkNoExcessiveSymbols(resume: ResumeData): boolean {
  const allText = flattenResumeToText(resume);
  const symbolMatch = allText.match(/[✦★☆✨🚀🔥]/g);
  return !symbolMatch || symbolMatch.length < 3;
}

function flattenResumeToText(resume: ResumeData): string {
  let text = '';
  text += `${resume.personal.fullName} ${resume.personal.headline} ${resume.personal.cityState} `;
  resume.projects.forEach(p => {
    text += `${p.name} ${p.bullets.join(' ')} ${p.techStack.join(' ')} `;
  });
  resume.skills.forEach(c => {
    text += `${c.skills.join(' ')} `;
  });
  resume.education.forEach(e => {
    text += `${e.institution} ${e.degree} `;
  });
  return text;
}

// ---------------------------------------------------------
// Category Scorers
// ---------------------------------------------------------

function scoreParseability(resume: ResumeData): ATSCategoryResult {
  const maxScore = 30;
  let score = maxScore;
  const passedChecks: string[] = [];
  const failedChecks: ATSFailedCheck[] = [];

  // 1. Template Check (10 pts)
  if (resume.settings.template === 'modern') {
    score -= 10;
    failedChecks.push({
      id: "no-multi-column-template",
      pointsLost: 10,
      message: "Your selected template uses a two-column sidebar. Switch to Classic or Bold for maximum ATS parsing compatibility.",
      fixAction: { type: "navigate", target: "settings.template" }
    });
  } else {
    passedChecks.push("Template is ATS-friendly (single column)");
  }

  // 2. Photo Check (5 pts)
  if (resume.settings.showPhoto && resume.personal.photo) {
    score -= 5;
    failedChecks.push({
      id: "no-photo-in-ats-mode",
      pointsLost: 5,
      message: "A profile photo is embedded. Many ATS parsers ignore or mishandle images.",
      fixAction: { type: "toggle", target: "settings.showPhoto" }
    });
  } else {
    passedChecks.push("No photo embedded (ATS safe)");
  }

  // 3. Section Headers (10 pts)
  // RESUMEMAKER uses "Projects" by default. Real ATS looks for Experience.
  // We'll flag it if they have projects but we can't explicitly call it Experience.
  if (resume.projects.length > 0) {
    score -= 5; // Slight penalty to encourage them
    failedChecks.push({
      id: "standard-section-headers",
      pointsLost: 5,
      message: "Your primary work section is titled 'Projects'. ATS keyword engines heavily weight a section literally named 'Experience' or 'Work Experience'.",
      fixAction: { type: "navigate", target: "projects" }
    });
  } else {
    passedChecks.push("Section headers are standard");
  }

  // 4. Single Page Density (5 pts)
  const pages = computedPageCount(resume);
  if (pages > 1) {
    score -= 5;
    failedChecks.push({
      id: "single-page-density",
      pointsLost: 5,
      message: "Resume likely overflows one page. Trim bullets to stay within a single page.",
      fixAction: { type: "navigate", target: "projects" }
    });
  } else {
    passedChecks.push("Resume fits on a single page");
  }

  return { score: Math.max(0, score), maxScore, passedChecks, failedChecks };
}

function extractKeywords(text: string): string[] {
  // Simple extraction: remove punctuation, split by space, remove common stop words
  const stopwords = new Set(["the","and","a","to","of","in","i","is","that","it","on","you","this","for","but","with","are","have","be","at","or","as","was","so","if","out","not"]);
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  return Array.from(new Set(words.filter(w => w.length > 3 && !stopwords.has(w))));
}

function scoreKeywordMatch(resume: ResumeData, jobDescription?: string): ATSCategoryResult {
  const maxScore = 30;
  const passedChecks: string[] = [];
  const failedChecks: ATSFailedCheck[] = [];
  
  if (!jobDescription || jobDescription.trim().length === 0) {
    // Generic fallback
    failedChecks.push({
      id: "no-jd",
      pointsLost: 15,
      message: "No Job Description provided. Score is based on generic overlap. Paste a target job description for an accurate score.",
      fixAction: { type: "highlight", target: "jobDescription" }
    });
    return { score: 15, maxScore, passedChecks, failedChecks };
  }

  const jdKeywords = extractKeywords(jobDescription);
  const resumeText = flattenResumeToText(resume).toLowerCase();

  const matched = jdKeywords.filter(kw => resumeText.includes(kw));
  const missing = jdKeywords.filter(kw => !resumeText.includes(kw));

  const matchRatio = jdKeywords.length > 0 ? matched.length / jdKeywords.length : 0;
  const score = Math.round(matchRatio * maxScore);

  if (matchRatio >= 0.7) {
    passedChecks.push(`High keyword overlap (${matched.length} keywords matched)`);
  } else {
    failedChecks.push({
      id: "low-keyword-match",
      pointsLost: maxScore - score,
      message: `Low keyword overlap. Missing keywords like: ${missing.slice(0, 5).join(', ')}`,
      fixAction: { type: "highlight", target: "jobDescription" }
    });
  }

  return { score, maxScore, passedChecks, failedChecks };
}

const actionVerbBank = [
  "built", "engineered", "designed", "developed", "implemented",
  "optimized", "led", "created", "automated", "deployed", "reduced", "improved",
  "architected", "spearheaded", "orchestrated", "resolved", "integrated"
];

const weakVerbs = ["worked on", "helped with", "responsible for", "did", "was involved in", "handled"];

function scoreContentQuality(resume: ResumeData): ATSCategoryResult {
  const maxScore = 25;
  let score = maxScore;
  const passedChecks: string[] = [];
  const failedChecks: ATSFailedCheck[] = [];

  const allBullets = resume.projects.flatMap(p => p.bullets).filter(b => b.trim().length > 0);
  
  if (allBullets.length === 0) {
    return {
      score: 0,
      maxScore,
      passedChecks,
      failedChecks: [{
        id: "no-bullets",
        pointsLost: 25,
        message: "No bullet points found in projects. Add detailed bullets to describe your work.",
        fixAction: { type: "navigate", target: "projects" }
      }]
    };
  }

  let actionVerbCount = 0;
  let quantifiedCount = 0;
  let weakVerbCount = 0;

  allBullets.forEach(bullet => {
    const firstWord = bullet.trim().split(" ")[0].toLowerCase();
    if (actionVerbBank.includes(firstWord)) actionVerbCount++;
    
    if (/\d+%|\$\d+|\d+x\b|\b\d+(k|K)?\+?\s*(users|requests|ms|records|hours|projects)/i.test(bullet)) {
      quantifiedCount++;
    }

    if (weakVerbs.some(w => bullet.toLowerCase().includes(w))) {
      weakVerbCount++;
    }
  });

  const actionVerbRatio = actionVerbCount / allBullets.length;
  const quantifiedRatio = quantifiedCount / allBullets.length;

  if (actionVerbRatio < 0.8) {
    const lost = 10 - Math.round(actionVerbRatio * 10);
    score -= lost;
    failedChecks.push({
      id: "weak-action-verbs",
      pointsLost: lost,
      message: "Many bullet points do not start with strong action verbs (e.g., Developed, Built).",
      fixAction: { type: "navigate", target: "projects" }
    });
  } else {
    passedChecks.push("Strong action verbs used");
  }

  if (quantifiedRatio < 0.5) {
    const lost = 10 - Math.round(quantifiedRatio * 20); // 0.5 ratio = 10 pts, 0 ratio = 0 pts
    const actualLost = Math.max(0, Math.min(10, lost));
    score -= actualLost;
    failedChecks.push({
      id: "low-quantification",
      pointsLost: actualLost,
      message: "Add quantified metrics (e.g., %, $, 10x) to more bullets to show measurable impact.",
      fixAction: { type: "navigate", target: "projects" }
    });
  } else {
    passedChecks.push("Excellent use of metrics and numbers");
  }

  if (weakVerbCount > 0) {
    score -= 5;
    failedChecks.push({
      id: "passive-voice",
      pointsLost: 5,
      message: `Found passive phrases like "worked on" or "responsible for". Use active verbs instead.`,
      fixAction: { type: "navigate", target: "projects" }
    });
  }

  return { score: Math.max(0, score), maxScore, passedChecks, failedChecks };
}

function scoreStructure(resume: ResumeData): ATSCategoryResult {
  const maxScore = 15;
  let score = maxScore;
  const passedChecks: string[] = [];
  const failedChecks: ATSFailedCheck[] = [];

  if (!isValidEmail(resume.personal.email)) {
    score -= 3;
    failedChecks.push({
      id: "email-format",
      pointsLost: 3,
      message: "Email address is missing or improperly formatted.",
      fixAction: { type: "navigate", target: "personal" }
    });
  } else {
    passedChecks.push("Valid email format");
  }

  if (!isValidPhone(resume.personal.phone)) {
    score -= 3;
    failedChecks.push({
      id: "phone-format",
      pointsLost: 3,
      message: "Phone number is missing or improperly formatted.",
      fixAction: { type: "navigate", target: "personal" }
    });
  } else {
    passedChecks.push("Valid phone format");
  }

  if (!checkNoExcessiveSymbols(resume)) {
    score -= 4;
    failedChecks.push({
      id: "excessive-symbols",
      pointsLost: 4,
      message: "Excessive special characters or emojis detected. Keep formatting simple for ATS.",
      fixAction: { type: "navigate", target: "projects" }
    });
  } else {
    passedChecks.push("Clean text formatting");
  }

  return { score: Math.max(0, score), maxScore, passedChecks, failedChecks };
}

export function computeATSCompatibility(
  resume: ResumeData,
): ATSCompatibilityResult {
  const jobDescription = resume.targetJobDescription;
  
  const parseability = scoreParseability(resume);       // out of 30
  const keywordMatch = scoreKeywordMatch(resume, jobDescription); // out of 30
  const contentQuality = scoreContentQuality(resume);   // out of 25
  const structure = scoreStructure(resume);             // out of 15

  const totalScore = parseability.score + keywordMatch.score + contentQuality.score + structure.score;

  return {
    totalScore,
    categories: { parseability, keywordMatch, contentQuality, structure },
    jobDescriptionProvided: !!jobDescription
  };
}
