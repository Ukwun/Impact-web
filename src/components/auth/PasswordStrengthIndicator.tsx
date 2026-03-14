'use client';

/**
 * Password Strength Indicator Component
 * Displays real-time password strength feedback
 */

import { useMemo, useState, useCallback } from 'react';
import { validatePassword, getPasswordStrengthColor, type PasswordStrengthResult } from '@/lib/security';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showFeedback?: boolean;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  showFeedback = true,
  className = '',
}: PasswordStrengthIndicatorProps) {
  const [analysis, setAnalysis] = useState<PasswordStrengthResult | null>(null);

  // Analyze password quality
  const result = useMemo(() => {
    if (!password) return null;
    return validatePassword(password);
  }, [password]);

  // Update analysis
  useMemo(() => {
    if (result) {
      setAnalysis(result);
    }
  }, [result]);

  if (!password || !analysis) {
    return null;
  }

  const strengthColor = getPasswordStrengthColor(analysis.strength);
  const strengthPercentage = (analysis.score / 4) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Password Strength
          </label>
          <span
            className="text-xs font-semibold capitalize"
            style={{ color: strengthColor }}
          >
            {analysis.strength === 'very-weak' && 'Very Weak'}
            {analysis.strength === 'weak' && 'Weak'}
            {analysis.strength === 'fair' && 'Fair'}
            {analysis.strength === 'good' && 'Good'}
            {analysis.strength === 'strong' && 'Strong'}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${strengthPercentage}%`,
              backgroundColor: strengthColor,
            }}
          />
        </div>
      </div>

      {/* Feedback Messages */}
      {showFeedback && analysis.feedback && analysis.feedback.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Password Requirements:
          </p>
          <ul className="space-y-1">
            {/* Length requirement */}
            <li className="flex items-center gap-2 text-xs">
              {password.length >= 8 ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className={password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                At least 8 characters
              </span>
            </li>

            {/* Uppercase requirement */}
            <li className="flex items-center gap-2 text-xs">
              {/[A-Z]/.test(password) ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                At least one uppercase letter (A-Z)
              </span>
            </li>

            {/* Lowercase requirement */}
            <li className="flex items-center gap-2 text-xs">
              {/[a-z]/.test(password) ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                At least one lowercase letter (a-z)
              </span>
            </li>

            {/* Numbers requirement */}
            <li className="flex items-center gap-2 text-xs">
              {/[0-9]/.test(password) ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className={/[0-9]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                At least one number (0-9)
              </span>
            </li>

            {/* Special characters requirement */}
            <li className="flex items-center gap-2 text-xs">
              {/[^a-zA-Z0-9]/.test(password) ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                At least one special character (!@#$%^&*)
              </span>
            </li>
          </ul>

          {/* Additional warnings */}
          {analysis.feedback.length > 0 && (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
              <ul className="space-y-1">
                {analysis.feedback.map((feedback, index) => (
                  <li key={index} className="text-xs text-amber-700 dark:text-amber-300">
                    • {feedback}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Success message */}
      {analysis.isValid && (
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300 font-medium">
            ✓ Password is strong and secure
          </p>
        </div>
      )}
    </div>
  );
}
