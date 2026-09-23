export interface ATSCategoryResult {
  score: number;
  maxScore: number;
  passedChecks: string[];
  failedChecks: ATSFailedCheck[];
}

export interface ATSFailedCheck {
  id: string;
  pointsLost: number;
  message: string;
  fixAction?: {
    type: "navigate" | "toggle" | "highlight";
    target: string; // e.g. "settings.template", "projects"
  };
}

export interface ATSCompatibilityResult {
  totalScore: number; // 0-100
  categories: {
    parseability: ATSCategoryResult;
    keywordMatch: ATSCategoryResult;
    contentQuality: ATSCategoryResult;
    structure: ATSCategoryResult;
  };
  jobDescriptionProvided: boolean;
}
