export type UserRole = 'STUDENT' | 'FACILITATOR' | 'ADMIN' | 'UNI_MEMBER';
export type NotificationPreference = 'ALL' | 'IMPORTANT' | 'NONE';
export type PrivacyLevel = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    [key: string]: string | undefined;
  };
  role: UserRole;
  joinedAt: Date;
  lastUpdated?: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  emailNotifications: NotificationPreference;
  courseNotifications: boolean;
  eventNotifications: boolean;
  weeklyDigest: boolean;
  privacy: PrivacyLevel;
  showEmail: boolean;
  showLocation: boolean;
  allowMessagesFromStranger: boolean;
  theme: 'dark' | 'light';
  language: string;
}

export interface UserAccountSettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  passwordLastChanged?: Date;
  sessionTimeout: number; // minutes
  activeDevices: number;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface PreferencesUpdate {
  emailNotifications?: NotificationPreference;
  courseNotifications?: boolean;
  eventNotifications?: boolean;
  weeklyDigest?: boolean;
  privacy?: PrivacyLevel;
  showEmail?: boolean;
  showLocation?: boolean;
  allowMessagesFromStranger?: boolean;
  theme?: 'dark' | 'light';
  language?: string;
}

// Validation constants
export const BIO_MAX_CHARS = 500;
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

export function validateProfileUpdate(data: UserProfileUpdate): string[] {
  const errors: string[] = [];

  if (data.firstName && data.firstName.trim().length === 0) {
    errors.push('First name cannot be empty');
  }

  if (data.lastName && data.lastName.trim().length === 0) {
    errors.push('Last name cannot be empty');
  }

  if (data.bio && data.bio.length > BIO_MAX_CHARS) {
    errors.push(`Bio must be less than ${BIO_MAX_CHARS} characters`);
  }

  if (data.website && !isValidUrl(data.website)) {
    errors.push('Website URL is invalid');
  }

  if (data.socialLinks?.twitter && !isValidTwitterHandle(data.socialLinks.twitter)) {
    errors.push('Invalid Twitter handle');
  }

  if (data.socialLinks?.linkedin && !isValidUrl(data.socialLinks.linkedin)) {
    errors.push('Invalid LinkedIn URL');
  }

  if (data.socialLinks?.github && !isValidGithubHandle(data.socialLinks.github)) {
    errors.push('Invalid GitHub username');
  }

  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidTwitterHandle(handle: string): boolean {
  return /^@?[a-zA-Z0-9_]{1,15}$/.test(handle);
}

function isValidGithubHandle(handle: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/i.test(handle);
}
