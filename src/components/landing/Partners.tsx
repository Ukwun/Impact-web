"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/apiConfig";

interface Partner {
  id: string;
  name: string;
  category: string;
  logo: string;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(getApiUrl("/api/public/partners"));
        if (!response.ok) throw new Error("Failed to fetch partners");
        const data = await response.json();

        setPartners(data.data || []);
        // Extract unique categories
        const uniqueCategories = [...new Set((data.data || []).map((p: Partner) => p.category))];
        setCategories(uniqueCategories.sort());
      } catch (err) {
        console.error("Error fetching partners:", err);
        setError("Failed to load partners");
        // Use defaults
        const defaultPartners = [
          { id: "1", name: "Federal Ministry of Education", category: "Government", logo: "FME" },
          {
            id: "2",
            name: "Ministry of Youth Development",
            category: "Government",
            logo: "MYD",
          },
          { id: "3", name: "FIRS Nigeria", category: "Government", logo: "FIRS" },
          { id: "4", name: "BudgIT Foundation", category: "NGO", logo: "BI" },
          { id: "5", name: "Ashoka Africa", category: "NGO", logo: "AA" },
          { id: "6", name: "Ford Foundation", category: "NGO", logo: "FF" },
        ];
        setPartners(defaultPartners);
        setCategories(["Government", "NGO"]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

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
          <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-white">
            Trusted By Leaders
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Built for collaboration and credibility
          </p>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            ImpactKnowledge works with educators, institutions, and partners committed to developing people and expanding opportunity.
          </p>
        </div>

        {/* Partners by Category */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-6 h-6 text-primary-500 animate-spin mr-2" />
            <span className="text-gray-400">Loading partners...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-16 text-danger-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <>
            {categories.map((category) => {
              const categoryPartners = partners.filter((p) => p.category === category);
              const categoryColors: Record<string, string> = {
                Government: "text-blue-400 border-blue-400/30",
                NGO: "text-green-400 border-green-400/30",
              };

              return (
                <div key={category} className="mb-16">
                  <h3 className="font-sora text-2xl font-bold text-white mb-8 text-center">
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
          </>
        )}

        {/* Become a Partner CTA - Removed, now has separate component */}
      </div>
    </section>
  );
}
