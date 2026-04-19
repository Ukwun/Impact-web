'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Save,
  X,
  AlertCircle,
  Check,
  Loader,
  Twitter,
  Linkedin,
  Github,
} from 'lucide-react';
import { useUserProfile, useProfileMutations } from '@/hooks/useProfile';
import { useNotifications } from '@/context/NotificationContext';
import { createNotification } from '@/types/notification';
import {
  validateProfileUpdate,
  BIO_MAX_CHARS,
  MAX_AVATAR_SIZE,
  ALLOWED_AVATAR_TYPES,
} from '@/types/userProfile';

interface ProfileEditorProps {
  userId: string;
  onSave?: () => void;
}

export function ProfileEditor({ userId, onSave }: ProfileEditorProps) {
  const { profile, isLoading: isLoadingProfile } = useUserProfile(userId);
  const { updateProfile, uploadProfileAvatar, isLoading, error } = useProfileMutations();
  const { addNotification } = useNotifications();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when profile loads
  if (profile && firstName === '') {
    setFirstName(profile.firstName || '');
    setLastName(profile.lastName || '');
    setBio(profile.bio || '');
    setLocation(profile.location || '');
    setWebsite(profile.website || '');
    setTwitter(profile.socialLinks?.twitter || '');
    setLinkedin(profile.socialLinks?.linkedin || '');
    setGithub(profile.socialLinks?.github || '');
    setAvatarPreview(profile.avatar || null);
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      addNotification(
        createNotification(
          'Invalid File Type',
          'Please upload JPEG, PNG, or WebP image',
          'error',
          { priority: 'medium' }
        )
      );
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      addNotification(
        createNotification(
          'File Too Large',
          'Avatar must be less than 5MB',
          'error',
          { priority: 'medium' }
        )
      );
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      setAvatarPreview(imageUrl);
      setIsDirty(true);

      try {
        await uploadProfileAvatar(userId, imageUrl);
        addNotification(
          createNotification('Avatar Updated', 'Your profile picture has been updated', 'success', {
            priority: 'low',
            duration: 3000,
          })
        );
      } catch (err) {
        addNotification(
          createNotification('Upload Failed', 'Could not update avatar', 'error', {
            priority: 'high',
          })
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    // Validate
    const errors = validateProfileUpdate({
      firstName,
      lastName,
      bio,
      location,
      website,
      socialLinks: { twitter, linkedin, github },
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      addNotification(
        createNotification(
          'Validation Failed',
          `${errors.length} error(s) found. Please check your input.`,
          'error',
          { priority: 'high' }
        )
      );
      return;
    }

    try {
      await updateProfile(userId, {
        firstName,
        lastName,
        bio,
        location,
        website,
        socialLinks: {
          twitter,
          linkedin,
          github,
        },
      });

      setIsDirty(false);
      setValidationErrors([]);

      addNotification(
        createNotification(
          'Profile Updated',
          'Your profile has been saved successfully',
          'success',
          { priority: 'low', duration: 4000 }
        )
      );

      onSave?.();
    } catch (err) {
      addNotification(
        createNotification('Save Failed', 'Could not save profile', 'error', { priority: 'high' })
      );
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>

        <div className="flex items-center gap-6">
          {/* Avatar Preview */}
          <div className="flex-shrink-0">
            <img
              src={avatarPreview || profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-dark-600"
            />
          </div>

          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
            <p className="text-xs text-gray-400 mt-2">JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={profile?.email || ''}
            disabled
            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-gray-500 text-sm cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Tell us about yourself..."
            maxLength={BIO_MAX_CHARS}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            {bio.length}/{BIO_MAX_CHARS} characters
          </p>
        </div>
      </div>

      {/* Location & Website */}
      <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Location & Website</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setIsDirty(true);
              }}
              placeholder="City, Country"
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                setIsDirty(true);
              }}
              placeholder="https://example.com"
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              Twitter
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm">@</span>
              <input
                type="text"
                value={twitter}
                onChange={(e) => {
                  setTwitter(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="username"
                className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => {
                setLinkedin(e.target.value);
                setIsDirty(true);
              }}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Github className="w-4 h-4" />
              GitHub
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm">github.com/</span>
              <input
                type="text"
                value={github}
                onChange={(e) => {
                  setGithub(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="username"
                className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded-r text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <h4 className="font-medium text-red-300">Validation Errors</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-300 ml-7">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isLoading || !isDirty}
          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>

        {isDirty && (
          <button
            onClick={() => {
              if (profile) {
                setFirstName(profile.firstName || '');
                setLastName(profile.lastName || '');
                setBio(profile.bio || '');
                setLocation(profile.location || '');
                setWebsite(profile.website || '');
                setTwitter(profile.socialLinks?.twitter || '');
                setLinkedin(profile.socialLinks?.linkedin || '');
                setGithub(profile.socialLinks?.github || '');
                setAvatarPreview(profile.avatar || null);
                setIsDirty(false);
              }
            }}
            className="px-4 py-2 bg-dark-600 text-white rounded-lg font-medium hover:bg-dark-500 transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
