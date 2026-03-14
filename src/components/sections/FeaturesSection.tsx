import { Container } from "@/components/ui/Container";
import { GraduationCap, Zap, BarChart3, Users, Briefcase, Award, BookMarked, Star } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Learning Management",
    description: "Comprehensive courses, video lessons, quizzes, and assignments tailored for every role.",
    color: "from-primary-500 to-primary-400",
  },
  {
    icon: Users,
    title: "Community Platform",
    description: "Connect with students, facilitators, and professionals. Share ideas and grow together.",
    color: "from-secondary-500 to-secondary-400",
  },
  {
    icon: Zap,
    title: "Event Management",
    description: "Discover national events, register, and track your participation in real-time.",
    color: "from-primary-600 to-primary-500",
  },
  {
    icon: Briefcase,
    title: "Venture Lab",
    description: "Launch your startup idea with mentorship, milestone tracking, and pitch opportunities.",
    color: "from-dark-500 to-dark-600",
  },
  {
    icon: Award,
    title: "Certification",
    description: "Earn recognized certificates with QR verification and shareable credentials.",
    color: "from-secondary-500 to-primary-500",
  },
  {
    icon: BarChart3,
    title: "Impact Analytics",
    description: "Track your progress and see your impact across the entire platform.",
    color: "from-primary-600 to-secondary-400",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-dark-800 via-dark-900 to-dark-800 relative overflow-hidden border-y border-dark-700">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-primary-600 opacity-5 rounded-full blur-3xl -mr-36"></div>
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-secondary-600 opacity-5 rounded-full blur-3xl -ml-36"></div>

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-block">
            <span className="px-4 py-2 bg-primary-600/20 text-primary-300 text-sm font-bold rounded-full flex items-center gap-2 mx-auto border border-primary-500/30">
              <Star className="w-4 h-4" />
              Powerful Features
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Comprehensive tools designed to empower learners, educators, and entrepreneurs at every stage of their journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-8 bg-dark-700/50 border-2 border-dark-600 rounded-2xl hover:border-primary-500 hover:shadow-xl hover:shadow-primary-600/20 transition-all overflow-hidden relative"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                ></div>

                {/* Icon container */}
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-black text-xl text-white mb-3 group-hover:text-primary-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom accent */}
                <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${feature.color} group-hover:w-full transition-all`}></div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
