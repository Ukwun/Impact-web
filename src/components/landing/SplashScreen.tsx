"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash for 3.5 seconds then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Complete animation after fade transition
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 600);
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-dark-500 via-dark-600 to-dark-700 flex flex-col items-center justify-center z-50 transition-opacity duration-600 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Logo with animation */}
        <div className="animate-pulse">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <span className="text-4xl font-black text-white">IE</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-white leading-tight">
            ImpactEdu
          </h1>
          <div className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 font-bold animate-pulse">
            Learning. Building. Leading.
          </div>
        </div>

        {/* Loading indicator */}
        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </div>
    </div>
  );
}
