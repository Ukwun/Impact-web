'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('🚨 Error caught by global boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Something went wrong!</h1>
          <p className="text-gray-400">An unexpected error occurred. Please try again.</p>
        </div>

        <div className="bg-dark-600 border border-dark-500 rounded-lg p-4">
          <p className="text-sm text-gray-400 font-mono break-words">
            {error.message || 'Unknown error'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-primary-600 hover:bg-primary-700"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 bg-dark-600 hover:bg-dark-500"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
