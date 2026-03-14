import { Users, MessageCircle, Trophy } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-6 py-24 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-black text-text-500">
          Join Our Community
        </h1>
        <p className="text-xl text-gray-300">
          Connect, collaborate, and grow with 50K+ impact makers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Users,
            title: "Member Directory",
            description: "Connect with fellow learners, mentors, and entrepreneurs",
            stats: "50K+ members",
          },
          {
            icon: MessageCircle,
            title: "Discussion Forums",
            description: "Share ideas, ask questions, and learn from others",
            stats: "25K+ active conversations",
          },
          {
            icon: Trophy,
            title: "Achievements & Recognition",
            description: "Earn badges, certifications, and recognition",
            stats: "500+ success stories",
          },
        ].map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 p-8 hover:shadow-xl transition-all duration-300"
            >
              <Icon className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-black text-text-500 mb-2">
                {section.title}
              </h3>
              <p className="text-gray-300 mb-4">{section.description}</p>
              <p className="text-sm font-semibold text-primary-600">
                {section.stats}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 p-12 text-white text-center space-y-4">
        <h2 className="text-3xl font-black">Want to Build Something Together?</h2>
        <p className="text-lg text-primary-50">Start a project team or circle</p>
        <button className="bg-dark-700/50 text-primary-400 px-8 py-3 rounded-lg font-bold hover:bg-dark-600 transition-all duration-300">
          Create Project Team
        </button>
      </div>
    </div>
  );
}
