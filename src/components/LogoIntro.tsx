"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";

export default function LogoIntro() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hide = (delay = 0) => {
    setIsFadingOut(true);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => setIsVisible(false), delay);
  };

  useEffect(() => {
    // Animation sequence
    const startAnimation = () => {
      // Stage 1: Logo appears (0.5s)
      setTimeout(() => setAnimationStage(1), 200);

      // Stage 2: Text appears (1s)
      setTimeout(() => setAnimationStage(2), 700);

      // Stage 3: Tagline appears (1.5s)
      setTimeout(() => setAnimationStage(3), 1200);
    };

    startAnimation();

    // Ensure the intro never hangs - hide it after 4 seconds max
    maxTimerRef.current = setTimeout(() => {
      hide(600);
    }, 4000);

    // Fade out after 2.5 seconds for a smooth experience
    fadeTimerRef.current = setTimeout(() => {
      hide(600);
    }, 2500);

    return () => {
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-dark-900 to-black transition-all duration-700 ${
        isFadingOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      onClick={() => {
        // Allow skipping the intro by clicking anywhere
        if (!isFadingOut) {
          hide(200);
        }
      }}
      style={{
        background: isFadingOut
          ? "linear-gradient(135deg, #111827 0%, #0f172a 50%, #000000 100%)"
          : "linear-gradient(135deg, #1f2937 0%, #111827 30%, #0f172a 70%, #000000 100%)"
      }}
    >
      <div className="text-center text-white relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-500/20 rounded-full blur-xl transition-all duration-1000 ${
            animationStage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-secondary-500/30 rounded-full blur-lg transition-all duration-1000 delay-300 ${
            animationStage >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}></div>
        </div>

        {/* Logo */}
        <div className={`mx-auto mb-8 transition-all duration-1000 transform ${
          animationStage >= 1 ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 rotate-180"
        }`}>
          <Logo size="lg" />
        </div>

        {/* Title */}
        <h1 className={`text-5xl md:text-6xl font-black mb-4 transition-all duration-1000 transform ${
          animationStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Impact
          </span>
          <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            App
          </span>
        </h1>

        {/* Tagline */}
        <p className={`text-xl text-gray-300 font-light transition-all duration-1000 transform ${
          animationStage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          Learning. Building. Leading.
        </p>

        {/* Loading indicator */}
        <div className={`mt-8 flex justify-center transition-all duration-500 ${
          animationStage >= 3 ? "opacity-100" : "opacity-0"
        }`}>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Skip hint */}
        <p className={`text-xs text-gray-500 mt-6 transition-all duration-500 ${
          animationStage >= 3 ? "opacity-100" : "opacity-0"
        }`}>
          Click anywhere to skip
        </p>
      </div>
    </div>
  );
}