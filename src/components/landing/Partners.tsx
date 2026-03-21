"use client";

import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  category: string;
  logo: string;
}

export default function Partners() {
  const partners: Partner[] = [
    // Government
    { id: "1", name: "Federal Ministry of Education", category: "Government", logo: "FME" },
    {
      id: "2",
      name: "Ministry of Youth Development",
      category: "Government",
      logo: "MYD",
    },
    { id: "3", name: "FIRS Nigeria", category: "Government", logo: "FIRS" },

    // NGOs
    { id: "4", name: "BudgIT Foundation", category: "NGO", logo: "BI" },
    { id: "5", name: "Ashoka Africa", category: "NGO", logo: "AA" },
    { id: "6", name: "Ford Foundation", category: "NGO", logo: "FF" },
  ];

  const categories = ["Government", "NGO"];

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-br from-dark-500 to-dark-600 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl lg:text-6xl font-black text-white">
            Trusted By Leaders
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Partnering with government and NGOs to empower Africa's next generation
          </p>
        </div>

        {/* Partners by Category */}
        {categories.map((category) => {
          const categoryPartners = partners.filter((p) => p.category === category);
          const categoryColors: Record<string, string> = {
            Government: "text-blue-400 border-blue-400/30",
            NGO: "text-green-400 border-green-400/30",
          };

          return (
            <div key={category} className="mb-16">
              <h3 className="text-2xl font-black text-white mb-8 text-center">
                {category}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {categoryPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className={`group flex items-center justify-center p-6 rounded-xl bg-dark-400 border-2 hover:bg-dark-500 hover:shadow-lg transition-all duration-300 ${
                      categoryColors[category]
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                        {partner.logo}
                      </div>
                      <p className="text-xs font-semibold text-gray-300 text-center line-clamp-2">
                        {partner.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Become a Partner CTA */}
        <div className="mt-20 text-center p-8 rounded-2xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-2 border-primary-500 border-opacity-50">
          <h3 className="text-2xl font-black text-white mb-3">
            Become a Partner
          </h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Join our network of organizations committed to empowering Africa's next generation
          </p>
          <a href="mailto:partnerships@impactclub.com?subject=Partnership%20Inquiry%20-%20ImpactClub" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            Partner With Us
          </a>
        </div>
      </div>
    </section>
  );
}
