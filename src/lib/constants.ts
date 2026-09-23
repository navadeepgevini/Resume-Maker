// Page dimensions at 96 DPI (for CSS rendering)
export const PAGE_DIMENSIONS = {
  letter: { width: 816, height: 1056 }, // 8.5" x 11" at 96 DPI
  a4: { width: 794, height: 1123 },     // 210mm x 297mm at 96 DPI
} as const;

// Page dimensions in TWIPs (for docx generation)
export const PAGE_TWIPS = {
  letter: { width: 12240, height: 15840 },
  a4: { width: 11906, height: 16838 },
} as const;

// Margins in pixels at 96 DPI (0.5 inch = 48px)
export const PAGE_MARGINS_PX = 48;

// Margins in TWIPs (0.5 inch = 720 TWIPs)
export const PAGE_MARGINS_TWIPS = 720;

// Font size ranges for auto-adjustment (in pt)
export const FONT_SIZES = {
  name: { min: 18, max: 22, default: 22 },
  headline: { min: 10, max: 12, default: 11 },
  sectionHeader: { min: 9, max: 11, default: 10.5 },
  body: { min: 9, max: 10.5, default: 10 },
  contact: { min: 8, max: 9.5, default: 9 },
} as const;

// Line height ranges
export const LINE_HEIGHTS = {
  min: 1.15,
  max: 1.35,
  default: 1.3,
} as const;

// Section spacing ranges (in px)
export const SECTION_SPACING = {
  min: 4,
  max: 12,
  default: 10,
} as const;

// Design tokens
export const COLORS = {
  background: '#FAFAF9',
  ink: '#1C1C1A',
  warmGray: '#6B6B63',
  accent: '#33415C',
  divider: '#E4E4DF',
  error: '#B91C1C',
  success: '#15803D',
  white: '#FFFFFF',
} as const;

// Default skill categories
export const DEFAULT_SKILL_CATEGORIES = [
  'Languages',
  'Frameworks & Libraries',
  'Tools & Platforms',
  'Databases',
] as const;

// Max featured projects
export const MAX_FEATURED_PROJECTS = 4;

// Max photo file size (5MB)
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

// Accepted photo MIME types
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png'] as const;

// Debounce delay for preview updates (ms)
export const PREVIEW_DEBOUNCE_MS = 300;

// localStorage key
export const STORAGE_KEY = 'resumeforge_data';
