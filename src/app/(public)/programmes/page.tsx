export default function ProgrammesPage() {
  return (
    <div className="container mx-auto px-6 py-24 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-black text-text-500">
          Our Programmes
        </h1>
        <p className="text-xl text-gray-300">
          Explore our comprehensive ecosystem of learning programmes designed for every stage of your journey
        </p>
      </div>

      {/* Programmes Grid - Coming Soon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "ImpactSchools", desc: "Secondary & Primary Education", icon: "📚" },
          { title: "ImpactUni", desc: "University & Higher Education", icon: "🎓" },
          { title: "ImpactCircle", desc: "Professional Networking", icon: "💼" },
          { title: "Impact Events", desc: "Immersive Learning Events", icon: "🎪" },
        ].map((prog) => (
          <div
            key={prog.title}
            className="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 p-8 text-center hover:shadow-lg transition-all duration-300"
          >
            <div className="text-5xl mb-4">{prog.icon}</div>
            <h3 className="text-xl font-black text-text-500 mb-2">{prog.title}</h3>
            <p className="text-gray-300 text-sm">{prog.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
