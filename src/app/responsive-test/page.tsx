"use client";

import { useState, useEffect } from "react";

export default function ResponsiveTestPage() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-8 text-center">
          Responsive Design Test
        </h1>

        {/* Screen Size Info */}
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Screen Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-primary-400">{windowSize.width}px</p>
              <p className="text-sm text-gray-400">Width</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-secondary-400">{windowSize.height}px</p>
              <p className="text-sm text-gray-400">Height</p>
            </div>
            <div className="text-center">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                isMobile ? 'bg-red-500/20 text-red-400' :
                isTablet ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              </div>
              <p className="text-sm text-gray-400 mt-1">Device Type</p>
            </div>
          </div>
        </div>

        {/* Responsive Elements Test */}
        <div className="space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Responsive Elements</h2>

          {/* Text Scaling Test */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white mb-3">Text Scaling</h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-300">
              This text scales from small (mobile) to large (desktop). Current size: {
                windowSize.width < 640 ? 'small' :
                windowSize.width < 768 ? 'medium' :
                'large'
              }
            </p>
          </div>

          {/* Grid Layout Test */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white mb-3">Grid Layout</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="bg-primary-500/20 border border-primary-500/30 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-sm sm:text-base font-bold text-primary-300">Item {num}</p>
                </div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-3">
              Grid: {windowSize.width < 640 ? '1 column' : windowSize.width < 1024 ? '2 columns' : '4 columns'}
            </p>
          </div>

          {/* Button Responsiveness */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white mb-3">Button Responsiveness</h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors">
                Primary Button
              </button>
              <button className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 border border-secondary-500 text-secondary-400 hover:bg-secondary-500/10 rounded-lg font-semibold transition-colors">
                Secondary Button
              </button>
            </div>
          </div>

          {/* Spacing Test */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white mb-3">Spacing & Padding</h3>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="p-2 sm:p-3 md:p-4 bg-primary-500/10 border border-primary-500/20 rounded">
                <p className="text-xs sm:text-sm text-primary-300">Small padding on mobile, larger on desktop</p>
              </div>
              <div className="p-3 sm:p-4 md:p-6 bg-secondary-500/10 border border-secondary-500/20 rounded">
                <p className="text-sm sm:text-base text-secondary-300">Medium padding scaling</p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakpoint Indicators */}
        <div className="mt-8 bg-dark-800/50 border border-dark-700 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Tailwind Breakpoints</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className={`p-3 rounded-lg ${windowSize.width >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              <p className="font-bold">Default</p>
              <p className="text-xs">≥0px</p>
            </div>
            <div className={`p-3 rounded-lg ${windowSize.width >= 640 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              <p className="font-bold">sm</p>
              <p className="text-xs">≥640px</p>
            </div>
            <div className={`p-3 rounded-lg ${windowSize.width >= 768 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              <p className="font-bold">md</p>
              <p className="text-xs">≥768px</p>
            </div>
            <div className={`p-3 rounded-lg ${windowSize.width >= 1024 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              <p className="font-bold">lg</p>
              <p className="text-xs">≥1024px</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}