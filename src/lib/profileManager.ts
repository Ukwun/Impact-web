'use server';

import {
  UserProfile,
  UserPreferences,
  UserProfileUpdate,
  PreferencesUpdate,
} from '@/types/userProfile';

// Mock user profile
const MOCK_PROFILE: UserProfile = {
  id: 'user-1',
  email: 'student@example.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  bio: 'Passionate learner exploring financial literacy and investment strategies.',
  location: 'San Francisco, CA',
  website: 'https://johndoe.com',
  socialLinks: {
    twitter: '@johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'johndoe',
  },
  role: 'STUDENT',
  joinedAt: new Date('2023-01-15'),
};

// Mock preferences
const MOCK_PREFERENCES: UserPreferences = {
  id: 'prefs-1',
  userId: 'user-1',
  emailNotifications: 'IMPORTANT',
  courseNotifications: true,
  eventNotifications: true,
  weeklyDigest: true,
  privacy: 'PUBLIC',
  showEmail: false,
  showLocation: true,
  allowMessagesFromStranger: true,
  theme: 'dark',
  language: 'en',
};

/**
 * GET /api/profile
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    if (userId === 'user-1') {
      return MOCK_PROFILE;
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

/**
 * PUT /api/profile
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: UserProfileUpdate
): Promise<UserProfile> {
  try {
    const updated: UserProfile = {
      ...MOCK_PROFILE,
      ...updates,
      lastUpdated: new Date(),
      socialLinks: {
        ...MOCK_PROFILE.socialLinks,
        ...updates.socialLinks,
      },
    };
    return updated;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * PUT /api/profile/avatar
 * Upload profile avatar
 */
export async function uploadAvatar(userId: string, imageUrl: string): Promise<UserProfile> {
  try {
    const updated: UserProfile = {
      ...MOCK_PROFILE,
      avatar: imageUrl,
      lastUpdated: new Date(),
    };
    return updated;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

/**
 * GET /api/preferences
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    if (userId === 'user-1') {
      return MOCK_PREFERENCES;
    }
    return null;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw error;
  }
}

/**
 * PUT /api/preferences
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: PreferencesUpdate
): Promise<UserPreferences> {
  try {
    const updated: UserPreferences = {
      ...MOCK_PREFERENCES,
      ...updates,
    };
    return updated;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
}
