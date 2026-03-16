"use client";

// Simple test to verify the application is working
import { useState, useEffect } from "react";

export default function TestPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsLoaded(true);
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            ImpactApp Test Page
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Verifying responsive design and functionality
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Screen Size</h3>
              <p className="text-gray-300">
                {windowSize.width} × {windowSize.height}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-2">CSS Loaded</h3>
              <p className="text-green-400 font-bold">✅ Working</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-2">JavaScript</h3>
              <p className="text-green-400 font-bold">✅ {isLoaded ? 'Loaded' : 'Loading...'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Responsive Breakpoints Test</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-blue-500 text-white p-4 rounded-lg">Mobile</div>
              <div className="bg-green-500 text-white p-4 rounded-lg hidden sm:block">SM (640px+)</div>
              <div className="bg-yellow-500 text-white p-4 rounded-lg hidden md:block">MD (768px+)</div>
              <div className="bg-red-500 text-white p-4 rounded-lg hidden lg:block">LG (1024px+)</div>
              <div className="bg-purple-500 text-white p-4 rounded-lg hidden xl:block">XL (1280px+)</div>
              <div className="bg-pink-500 text-white p-4 rounded-lg hidden 2xl:block">2XL (1536px+)</div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">Real-World Functionality Test</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                Primary Button
              </button>
              <button className="bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                Secondary Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}