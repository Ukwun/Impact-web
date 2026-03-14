import { Target, Heart, Lightbulb } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-24 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-black text-text-500">
          About ImpactEdu
        </h1>
        <p className="text-xl text-gray-300">
          Empowering Africa&apos;s next generation of leaders, entrepreneurs, and innovators
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 p-12">
        <h2 className="text-3xl font-black text-text-500 mb-4">Our Story</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Founded in 2023, ImpactEdu was born from a simple belief: every young
          person deserves access to quality education and opportunities for growth.
          What started as a small initiative in Nigeria has grown into a continent-wide
          movement, empowering over 50,000 learners across Africa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Target,
            title: "Our Mission",
            description:
              "To provide accessible, world-class educational content and mentorship to empower young Africans to become leaders in their communities.",
          },
          {
            icon: Heart,
            title: "Our Values",
            description:
              "Integrity, inclusivity, innovation, and impact. We believe education should be transformative and accessible to all.",
          },
          {
            icon: Lightbulb,
            title: "Our Vision",
            description:
              "A thriving ecosystem where talent is nurtured, opportunities are created, and Africa's potential is fully realized.",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-text-500">
                {item.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 p-12 text-white">
        <h2 className="text-3xl font-black mb-6">By The Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { stat: "50K+", label: "Active Learners" },
            { stat: "1,250", label: "Partner Schools" },
            { stat: "45", label: "Universities" },
            { stat: "3,250+", label: "Entrepreneurs" },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <p className="text-4xl font-black mb-2">{item.stat}</p>
              <p className="text-primary-100">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-dark-700/50 border-2 border-gray-600 p-12">
        <h2 className="text-3xl font-black text-text-500 mb-8">Our Team</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          Our team comprises passionate educators, entrepreneurs, technologists, and
          community leaders committed to transforming education across Africa. We bring
          together diverse expertise to create truly impactful learning experiences.
        </p>
        <button className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300">
          View Team Profiles
        </button>
      </div>
    </div>
  );
}
