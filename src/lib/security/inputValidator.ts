/**
 * Input Validation System
 * Comprehensive validation for all API inputs
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  // Email validation
  email: z.string().email('Invalid email address').toLowerCase(),

  // Password validation
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),

  // Username validation
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),

  // Full name validation
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  // Phone number validation
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),

  // URL validation
  url: z.string().url('Invalid URL'),

  // Positive integer
  positiveInt: z.number().int().positive('Must be a positive number'),

  // ID validation (UUID or MongoDB ObjectId)
  id: z.union([
    z.string().uuid('Invalid ID format'),
    z.string().regex(/^[0-9a-f]{24}$/, 'Invalid ID format'),
    z.string().regex(/^\d+$/, 'Invalid ID format'),
  ]),

  // Date validation
  date: z.string().datetime('Invalid date format'),

  // JSON string (for parsing JSON from form data)
  jsonString: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid JSON string' }
  ),

  // Role validation
  role: z.enum(['student', 'parent', 'facilitator', 'school_admin', 'uni_member', 'circle_member', 'mentor', 'admin'], {
    errorMap: () => ({ message: 'Invalid role selected' }),
  }),
};

/**
 * Complete validation schemas for common API operations
 */
export const APIValidationSchemas = {
  // Authentication
  login: z.object({
    email: ValidationSchemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  register: z.object({
    email: ValidationSchemas.email,
    password: ValidationSchemas.password,
    confirmPassword: z.string(),
    fullName: ValidationSchemas.fullName,
    role: ValidationSchemas.role,
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  }),

  // Course operations
  enrollCourse: z.object({
    courseId: ValidationSchemas.id,
  }),

  completeLessonCourseProgress: z.object({
    lessonId: ValidationSchemas.id,
    secondsWatched: z.number().int().min(0).optional(),
  }),

  // User profile
  updateProfile: z.object({
    fullName: ValidationSchemas.fullName.optional(),
    phone: ValidationSchemas.phone.optional(),
    bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
    avatar: z.string().url().optional(),
  }),

  // Password reset
  requestPasswordReset: z.object({
    email: ValidationSchemas.email,
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: ValidationSchemas.password,
    confirmPassword: z.string(),
  }),

  // Contact form
  contactForm: z.object({
    name: ValidationSchemas.fullName,
    email: ValidationSchemas.email,
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  }),

  // Quiz submission
  submitQuiz: z.object({
    quizId: ValidationSchemas.id,
    answers: z.array(
      z.object({
        questionId: ValidationSchemas.id,
        answer: z.union([z.string(), z.number(), z.array(z.string())]),
      })
    ),
  }),

  // Assignment submission
  submitAssignment: z.object({
    assignmentId: ValidationSchemas.id,
    content: z.string().min(10, 'Content must be at least 10 characters').max(50000),
    fileUrl: z.string().url().optional(),
  }),
};

/**
 * Validate input against schema and return errors
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { valid: true; data: T } | { valid: false; errors: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });

      return { valid: false, errors };
    }

    return { valid: false, errors: { _error: 'Validation failed' } };
  }
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize object properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as any)[key] = sanitizeInput(sanitized[key] as string);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      (sanitized as any)[key] = sanitizeObject(sanitized[key] as any);
    }
  }


  return sanitized;
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  allowedMimes: string[] = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB
): { valid: true } | { valid: false; error: string } {
  if (!allowedMimes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedMimes.join(', ')}` };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeBytes / 1024 / 1024}MB` };
  }

  return { valid: true };
}
