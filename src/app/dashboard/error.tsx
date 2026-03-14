'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error('🚨 Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-600 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <div>
          <h1 className="text-2xl font-black text-white mb-2">Dashboard Error</h1>
          <p className="text-gray-400 text-sm">
            We encountered an issue loading your dashboard. This often happens when data is still loading.
          </p>
        </div>

        <div className="bg-dark-700 border border-dark-500 rounded-lg p-3">
          <p className="text-xs text-gray-400 font-mono break-words">
            {error.message || 'Unknown error'}
          </p>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-dark-600 hover:bg-dark-500"
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
