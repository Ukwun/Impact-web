"use client";

import { useEffect, useRef, useState } from "react";

export default function LogoIntro() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hide = (delay = 0) => {
    setIsFadingOut(true);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => setIsVisible(false), delay);
  };

  useEffect(() => {
    // Ensure the intro never hangs - hide it after 3 seconds max
    maxTimerRef.current = setTimeout(() => {
      hide(400);
    }, 3000);

    // Fade out after 1.5 seconds for a faster experience
    fadeTimerRef.current = setTimeout(() => {
      hide(400);
    }, 1500);

    return () => {
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 transition-opacity duration-500 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={() => {
        // Allow skipping the intro by clicking anywhere
        if (!isFadingOut) {
          hide(0);
        }
      }}
    >
      <div className="text-center text-white">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-2">
          Impact<span className="text-blue-400">App</span>
        </h1>
        <p className="text-lg text-gray-300">
          Learning. Building. Leading.
        </p>
      </div>
    </div>
  );
}