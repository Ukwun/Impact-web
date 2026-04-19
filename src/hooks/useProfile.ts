import { useState, useEffect } from 'react';
import { UserProfile, UserPreferences, UserProfileUpdate, PreferencesUpdate } from '@/types/userProfile';
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserPreferences,
  updateUserPreferences,
} from '@/lib/profileManager';

// Profile cache
const profileCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

function getCachedData<T>(key: string, ttl: number): T | null {
  const cached = profileCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  profileCache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T, ttl: number): void {
  profileCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Hook for fetching user profile
 */
export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `profile-${userId}`;
    const cached = getCachedData<UserProfile>(cacheKey, 15 * 60 * 1000); // 15 min cache

    if (cached) {
      setProfile(cached);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserProfile(userId);
        setProfile(data);
        if (data) {
          setCachedData(cacheKey, data, 15 * 60 * 1000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, isLoading, error };
}

/**
 * Hook for fetching user preferences
 */
export function useUserPreferences(userId: string) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `preferences-${userId}`;
    const cached = getCachedData<UserPreferences>(cacheKey, 15 * 60 * 1000); // 15 min cache

    if (cached) {
      setPreferences(cached);
      setIsLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserPreferences(userId);
        setPreferences(data);
        if (data) {
          setCachedData(cacheKey, data, 15 * 60 * 1000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  return { preferences, isLoading, error };
}

/**
 * Hook for profile mutations
 */
export function useProfileMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (userId: string, updates: UserProfileUpdate) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await updateUserProfile(userId, updates);
      profileCache.delete(`profile-${userId}`);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfileAvatar = async (userId: string, imageUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await uploadAvatar(userId, imageUrl);
      profileCache.delete(`profile-${userId}`);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (userId: string, updates: PreferencesUpdate) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await updateUserPreferences(userId, updates);
      profileCache.delete(`preferences-${userId}`);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile, uploadProfileAvatar, updatePreferences, isLoading, error };
}
