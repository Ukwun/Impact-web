"use client";

export default function TestLanding() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="container mx-auto px-6 py-32">
        <h1 className="text-5xl font-black mb-6">Test - Can you see this?</h1>
        <p className="text-xl mb-4">If text is properly spaced and readable, CSS is working.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-primary-500/20 p-8 rounded-xl border border-primary-400/30">
            <h2 className="text-2xl font-bold mb-4">Column 1</h2>
            <p>This should be in a box with proper spacing.</p>
          </div>
          <div className="bg-secondary-500/20 p-8 rounded-xl border border-secondary-400/30">
            <h2 className="text-2xl font-bold mb-4">Column 2</h2>
            <p>This should be in another box with proper spacing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
