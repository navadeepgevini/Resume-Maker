import { FONT_SIZES, LINE_HEIGHTS, SECTION_SPACING, PAGE_DIMENSIONS } from './constants';
import type { FitCheckResult } from '@/types/resume';

export interface LayoutAdjustments {
  nameFontSize: number;
  headlineFontSize: number;
  sectionHeaderFontSize: number;
  bodyFontSize: number;
  contactFontSize: number;
  lineHeight: number;
  sectionSpacing: number;
}

/**
 * Returns the default layout settings.
 */
export function getDefaultLayout(): LayoutAdjustments {
  return {
    nameFontSize: FONT_SIZES.name.default,
    headlineFontSize: FONT_SIZES.headline.default,
    sectionHeaderFontSize: FONT_SIZES.sectionHeader.default,
    bodyFontSize: FONT_SIZES.body.default,
    contactFontSize: FONT_SIZES.contact.default,
    lineHeight: LINE_HEIGHTS.default,
    sectionSpacing: SECTION_SPACING.default,
  };
}

/**
 * Measures whether the resume content fits on one page.
 * Must be called from a client component with access to the DOM.
 * @param containerRef - Reference to the resume document container
 * @param pageSize - 'letter' or 'a4'
 */
export function checkFit(
  containerRef: HTMLElement | null,
  pageSize: 'letter' | 'a4'
): FitCheckResult {
  if (!containerRef) {
    return { fits: true, suggestions: [] };
  }

  const maxHeight = PAGE_DIMENSIONS[pageSize].height;
  const scrollHeight = containerRef.scrollHeight;

  if (scrollHeight <= maxHeight) {
    return { fits: true, suggestions: [] };
  }

  return {
    fits: false,
    suggestions: generateSuggestions(scrollHeight - maxHeight),
  };
}

/**
 * Generates suggestions for reducing content to fit on one page.
 */
function generateSuggestions(overflowPx: number): string[] {
  const suggestions: string[] = [];

  if (overflowPx > 100) {
    suggestions.push('Remove one or more projects to fit on one page');
    suggestions.push('Reduce project bullet points to 2 per project');
  } else if (overflowPx > 50) {
    suggestions.push('Remove one bullet point from a project');
    suggestions.push('Remove less important certifications');
  } else {
    suggestions.push('Try shortening some bullet points');
    suggestions.push('Remove optional sections like certifications');
  }

  return suggestions;
}

/**
 * Progressively adjusts layout to try to fit content on one page.
 * Returns adjusted layout settings.
 */
export function autoAdjustLayout(
  containerRef: HTMLElement | null,
  pageSize: 'letter' | 'a4',
  currentLayout: LayoutAdjustments
): { layout: LayoutAdjustments; fits: boolean } {
  if (!containerRef) {
    return { layout: currentLayout, fits: true };
  }

  const maxHeight = PAGE_DIMENSIONS[pageSize].height;
  const layout = { ...currentLayout };

  // Step 1: Reduce section spacing
  if (containerRef.scrollHeight > maxHeight) {
    layout.sectionSpacing = SECTION_SPACING.min;
  }

  // Step 2: Reduce line height
  if (containerRef.scrollHeight > maxHeight) {
    layout.lineHeight = LINE_HEIGHTS.min;
  }

  // Step 3: Reduce body font
  if (containerRef.scrollHeight > maxHeight) {
    layout.bodyFontSize = FONT_SIZES.body.min;
    layout.contactFontSize = FONT_SIZES.contact.min;
    layout.sectionHeaderFontSize = FONT_SIZES.sectionHeader.min;
    layout.headlineFontSize = FONT_SIZES.headline.min;
  }

  // Step 4: Reduce name font
  if (containerRef.scrollHeight > maxHeight) {
    layout.nameFontSize = FONT_SIZES.name.min;
  }

  const fits = containerRef.scrollHeight <= maxHeight;
  return { layout, fits };
}
