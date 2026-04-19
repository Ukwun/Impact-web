"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { useUniversityMember } from "@/hooks/useRoleDashboards";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import {
  TrendingUp,
  BookOpen,
  Target,
  Users,
  Loader,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  KPICard,
  ActionCard,
  InsightCard,
} from "@/components/dashboard/cards";

export default function UniversityMemberDashboard() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { data: universityData, loading, error } = useUniversityMember();
  const { isConnected } = useSocket({
    userId: user?.id,
    token:
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
        : undefined,
    enabled: !!user,
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-12 flex flex-col items-center gap-4 animate-fade-in">
          <Loader className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-gray-300 text-lg">Loading your venture dashboard...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-l-4 border-danger-500 bg-danger-50 animate-fade-in">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-7 h-7 text-danger-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-danger-700 text-lg">
              Error Loading Venture Dashboard
            </h3>
            <p className="text-danger-600 mt-2">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!universityData?.profile) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Welcome to ImpactUni</h3>
        <p className="text-gray-400 mb-6">
          Explore programs and start your learning journey today
        </p>
        <Button variant="primary" size="lg">
          Browse Programs
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div
        className={`space-y-4 transition-all duration-700 transform ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            Welcome, {universityData.profile.name} 🎓
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Your learning hub at {universityData.profile.institution}
          </p>
        </div>
      </div>

      {/* TOP ROW: Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Learning Hours */}
        <KPICard
          icon={TrendingUp}
          label="Learning Hours"
          value={universityData.stats.totalLearningHours || 0}
          status={`${universityData.stats.enrolledPrograms} courses`}
          gradientFrom="from-primary-500"
          gradientTo="to-primary-600"
          borderColor="border-primary-400"
        />

        {/* Completed Programs */}
        <ActionCard
          title="Programs Progress"
          description={`${universityData.stats.completedPrograms} of ${universityData.stats.enrolledPrograms} completed`}
          icon={Target}
          primaryAction={{
            label: "View Progress",
            onClick: () => router.push("/dashboard/university/programs"),
          }}
        />

        {/* Achievements Earned */}
        <InsightCard
          title="Achievements"
          icon={BookOpen}
          stats={[
            { label: "Total Achievements", value: universityData.stats.totalAchievements },
            { label: "Certificates", value: universityData.stats.certificatesEarned },
            { label: "Avg Progress", value: `${universityData.stats.averageProgress}%` },
          ]}
        >
          <p className="text-xs text-gray-400">
            Great progress! Keep learning to unlock more achievements.
          </p>
        </InsightCard>
      </div>

      {/* Enrolled Programs Section */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white">Your Learning Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {universityData.enrolledPrograms.map((program) => (
            <Card
              key={program.id}
              className="p-6 hover:border-primary-400 transition-colors border border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">{program.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Difficulty: {program.difficulty}
                  </p>
                </div>
                {program.isCompleted && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Completed
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${program.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{program.progress}% Complete</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Achievements Section */}
      {universityData.recentAchievements && universityData.recentAchievements.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {universityData.recentAchievements.slice(0, 3).map((achievement: any) => (
              <Card
                key={achievement.id}
                className="p-6 text-center hover:border-green-400 transition-colors border border-gray-700"
              >
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-bold text-white">{achievement.title || "Achievement"}</h3>
                <p className="text-xs text-gray-400 mt-2">
                  {achievement.description || "Badge Earned"}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Programs To Explore */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white">Explore More Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {universityData.availablePrograms.slice(0, 2).map((program) => (
            <Card
              key={program.id}
              className="p-6 hover:border-cyan-400 transition-colors border border-gray-700 cursor-pointer"
            >
              <h3 className="font-bold text-white">{program.title}</h3>
              <p className="text-sm text-gray-400 mt-2">{program.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-500">
                  {program.enrollmentCount} enrolled
                </span>
                <span className="text-xs bg-cyan-500 text-white px-2 py-1 rounded">
                  {program.difficulty}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4"
                onClick={() => console.log("Enroll in", program.title)}
              >
                Learn More
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Resources & Support Section */}
      <ActionCard
        title="Learning Resources"
        description="Access study materials, mentorship, and community support"
        icon={Users}
        primaryAction={{
          label: "Browse Resources",
          onClick: () => router.push("/dashboard/resources"),
        }}
        secondaryAction={{
          label: "Community Forum",
          onClick: () => router.push("/dashboard/community"),
        }}
        variant="success"
      />
    </div>
  );
}
