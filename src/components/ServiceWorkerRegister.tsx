'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('✅ Service Worker registered successfully', registration.scope);

          // Check for updates less frequently to avoid errors
          setInterval(() => {
            registration.update().catch((err) => {
              console.log('Service Worker update check failed:', err.message);
              // Don't throw error, just log it
            });
          }, 300000); // Check every 5 minutes instead of 1 minute
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error.message);
          // Don't throw error, service worker is not critical
        });
    }
  }, []);

  return null;
}
