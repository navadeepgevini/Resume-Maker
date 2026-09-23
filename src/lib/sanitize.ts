/**
 * Sanitize user input by stripping HTML tags and dangerous characters.
 * Works in both browser and server environments.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    // Let React handle escaping; we just want to avoid raw HTML insertion
    // Removing the &amp; etc. because it causes double-encoding in textareas/inputs.
    .trim();
}

/**
 * Sanitize text for use in Word documents.
 * Strips HTML but preserves plain text formatting.
 */
export function sanitizeForDocument(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Sanitize a URL - ensure it's a valid, safe URL.
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return parsed.href;
    }
    return '';
  } catch {
    return '';
  }
}
