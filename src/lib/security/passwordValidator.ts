/**
 * Password Strength Validator
 * Provides password strength checking and feedback
 */

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4; // 0 = very weak, 4 = very strong
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  isValid: boolean;
  entropy: number;
}

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
} as const;

const COMMON_PASSWORDS = [
  'password',
  '12345678',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  'letmein',
  '123456',
  'welcome',
  'monkey',
];

/**
 * Calculate password entropy (randomness/complexity)
 */
function calculateEntropy(password: string): number {
  const charsets = {
    lowercase: /[a-z]/.test(password) ? 26 : 0,
    uppercase: /[A-Z]/.test(password) ? 26 : 0,
    numbers: /[0-9]/.test(password) ? 10 : 0,
    special: /[^a-zA-Z0-9]/.test(password) ? 32 : 0,
  };

  const totalChars = Object.values(charsets).reduce((a, b) => a + b, 0);
  const entropy = password.length * Math.log2(totalChars);

  return entropy;
}

/**
 * Check if password is in common passwords list
 */
function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.some((common) =>
    password.toLowerCase().includes(common.toLowerCase())
  );
}

/**
 * Check for sequential patterns (123, abc, qwerty, etc.)
 */
function hasSequentialPatterns(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    'qwertyuiopasdfghjklzxcvbnm',
  ];

  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      if (
        password.toLowerCase().includes(seq.substring(i, i + 3)) ||
        password.toLowerCase().includes(seq.substring(i, i + 3).split('').reverse().join(''))
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check for repeated characters
 */
function hasRepeatedChars(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

/**
 * Validate password against security requirements
 */
export function validatePassword(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    feedback.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  } else {
    score++;
  }

  // Uppercase check
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter (A-Z)');
  } else if (/[A-Z]/.test(password)) {
    score++;
  }

  // Lowercase check
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter (a-z)');
  } else if (/[a-z]/.test(password)) {
    score++;
  }

  // Numbers check
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number (0-9)');
  } else if (/[0-9]/.test(password)) {
    score++;
  }

  // Special characters check
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Password must contain at least one special character (!@#$%^&*)');
  } else if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  }

  // Common password check
  if (isCommonPassword(password)) {
    feedback.push('Password is too common. Please choose a more unique password');
    score = Math.max(0, score - 1);
  }

  // Sequential pattern check
  if (hasSequentialPatterns(password)) {
    feedback.push('Password contains sequential patterns (like 123, abc). Avoid these for better security');
    score = Math.max(0, score - 1);
  }

  // Repeated characters check
  if (hasRepeatedChars(password)) {
    feedback.push('Password contains too many repeated characters. Avoid patterns like "aaa" or "111"');
    score = Math.max(0, score - 1);
  }

  // Calculate entropy
  const entropy = calculateEntropy(password);

  // Determine strength level based on score and entropy
  const finalScore = Math.min(4, Math.max(0, score + (entropy > 50 ? 1 : 0))) as
    | 0
    | 1
    | 2
    | 3
    | 4;

  const strengthLevels: Record<number, 'very-weak' | 'weak' | 'fair' | 'good' | 'strong'> = {
    0: 'very-weak',
    1: 'weak',
    2: 'fair',
    3: 'good',
    4: 'strong',
  };

  const isValid = finalScore >= 3 && feedback.length === 0;

  return {
    score: finalScore,
    strength: strengthLevels[finalScore],
    feedback,
    isValid,
    entropy,
  };
}

/**
 * Get password strength color for UI (red, orange, yellow, light-green, dark-green)
 */
export function getPasswordStrengthColor(
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong'
): string {
  const colors: Record<string, string> = {
    'very-weak': '#dc2626', // red
    'weak': '#ea580c', // orange
    'fair': '#eab308', // yellow
    'good': '#84cc16', // lime  
    'strong': '#16a34a', // green
  };

  return colors[strength];
}
