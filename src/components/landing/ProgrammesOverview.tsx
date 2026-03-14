"use client";

import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Users,
  Briefcase,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface Programme {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  students: string;
  courses: string;
}

export default function ProgrammesOverview() {
  const programmes: Programme[] = [
    {
      id: "schools",
      title: "ImpactSchools",
      description: "Transforming secondary and primary education with modern learning frameworks and digital literacy.",
      icon: <BookOpen className="w-8 h-8" />,
      color: "primary",
      students: "25,000+",
      courses: "120+",
    },
    {
      id: "uni",
      title: "ImpactUni",
      description: "Bridging university education with real-world industry skills and entrepreneurship training.",
      icon: <Users className="w-8 h-8" />,
      color: "secondary",
      students: "15,000+",
      courses: "85+",
    },
    {
      id: "circle",
      title: "ImpactCircle",
      description: "Professional networking ecosystem connecting leaders, mentors, and entrepreneurs across Africa.",
      icon: <Briefcase className="w-8 h-8" />,
      color: "green",
      students: "8,000+",
      courses: "40+",
    },
    {
      id: "events",
      title: "Impact Events",
      description: "Immersive summits, bootcamps, and networking events bringing the community together.",
      icon: <Calendar className="w-8 h-8" />,
      color: "blue",
      students: "5,000+",
      courses: "12+",
    },
  ];

  const colorMap: Record<string, string> = {
    primary:
      "from-primary-500 to-primary-600 border-primary-400 text-primary-600 bg-primary-50 hover:bg-primary-100 hover:border-primary-600",
    secondary:
      "from-secondary-500 to-secondary-600 border-secondary-400 text-secondary-600 bg-secondary-50 hover:bg-secondary-100 hover:border-secondary-600",
    green:
      "from-green-500 to-green-600 border-green-400 text-green-600 bg-green-50 hover:bg-green-100 hover:border-green-600",
    blue:
      "from-blue-500 to-blue-600 border-blue-400 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-600",
  };

  return (
    <section className="relative py-24 lg:py-32 bg-dark-800 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full -ml-48 -mt-48 opacity-30"></div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl lg:text-6xl font-black text-text-500">
            Our Programmes
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our comprehensive ecosystem designed for every stage of your learning journey
          </p>
        </div>

        {/* Programmes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programmes.map((programme) => {
            const bgColor = colorMap[programme.color];
            const gradientColor =
              programme.color === "primary"
                ? "from-primary-500 to-primary-600"
                : programme.color === "secondary"
                  ? "from-secondary-500 to-secondary-600"
                  : programme.color === "green"
                    ? "from-green-500 to-green-600"
                    : "from-blue-500 to-blue-600";

            return (
              <div
                key={programme.id}
                className="group relative rounded-2xl bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient header */}
                <div
                  className={`h-32 bg-gradient-to-br ${gradientColor} flex items-end p-6`}
                >
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-dark-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300"
                    style={{
                      color:
                        programme.color === "primary"
                          ? "#1FA774"
                          : programme.color === "secondary"
                            ? "#F5B400"
                            : programme.color === "green"
                              ? "#10b981"
                              : "#3b82f6",
                    }}
                  >
                    {programme.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-text-500 mb-2">
                      {programme.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {programme.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 py-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Active
                      </p>
                      <p className="text-xl font-black text-text-500">
                        {programme.students}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Courses
                      </p>
                      <p className="text-xl font-black text-text-500">
                        {programme.courses}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2 group/btn"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
