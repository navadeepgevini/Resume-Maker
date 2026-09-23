export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateRequired(value: string, fieldName: string = 'This field'): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email is required' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, message: 'Phone number is required' };
  }
  // International phone: allow +, digits, spaces, hyphens, parens
  const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
  if (!phoneRegex.test(phone.trim())) {
    return { valid: false, message: 'Please enter a valid phone number (e.g., +1 555-123-4567)' };
  }
  return { valid: true };
}

export function validateURL(url: string, fieldName: string = 'URL'): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { valid: true }; // URLs are usually optional
  }
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, message: `${fieldName} must use http or https` };
    }
    return { valid: true };
  } catch {
    return { valid: false, message: `Please enter a valid ${fieldName}` };
  }
}

export function validateYear(year: string, fieldName: string = 'Year'): ValidationResult {
  if (!year || year.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (year.toLowerCase() === 'present') {
    return { valid: true };
  }
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2040) {
    return { valid: false, message: `${fieldName} must be between 1950 and 2040` };
  }
  return { valid: true };
}

export function validateGrade(value: string, type: 'cgpa' | 'percentage'): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { valid: true }; // Grade can be optional
  }
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, message: 'Please enter a valid number' };
  }
  if (type === 'cgpa' && (num < 0 || num > 10)) {
    return { valid: false, message: 'CGPA must be between 0 and 10' };
  }
  if (type === 'percentage' && (num < 0 || num > 100)) {
    return { valid: false, message: 'Percentage must be between 0 and 100' };
  }
  return { valid: true };
}
