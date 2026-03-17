"use client";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-blue-500 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">ImpactEdu Landing Page</h1>
        <p className="text-xl mb-4">If you can read this with proper spacing, CSS is working.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white text-black p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-3">Column 1</h2>
            <p>This should be in a white box with proper padding.</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Test Button
            </button>
          </div>

          <div className="bg-green-500 text-white p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-3">Column 2</h2>
            <p>This should be in a green box with proper padding.</p>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Another Button
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg">If this looks properly formatted, the issue is with the complex components.</p>
          <p className="text-lg mt-2">If text is all jumbled together, CSS is broken.</p>
        </div>
      </div>
    </div>
  );
}
