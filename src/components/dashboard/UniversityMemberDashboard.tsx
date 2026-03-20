"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import {
  Lightbulb,
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
  OpportunityCard,
} from "@/components/dashboard/cards";

interface VentureData {
  id: string;
  name: string;
  stage: "ideation" | "validation" | "development" | "launch" | "growth";
  progress: number;
  milestone: string;
  nextMilestone: string;
  teamSize: number;
  fundingStatus: "not-started" | "seeking" | "secured";
  fundingAmount?: number;
}

interface OpportunityData {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline?: string;
  priority: "high" | "medium" | "low";
}

export default function UniversityMemberDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ventureData, setVentureData] = useState<VentureData | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const { user } = useAuth();
  const { isConnected } = useSocket({
    userId: user?.id,
    token:
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
        : undefined,
    enabled: !!user,
  });

  // Load venture data
  useEffect(() => {
    const loadVentureData = async () => {
      try {
        setLoading(true);
        // Mock data for demonstration - replace with actual API call
        const mockVenture: VentureData = {
          id: "venture-001",
          name: "FinTech Innovation Hub",
          stage: "development",
          progress: 65,
          milestone: "MVP Development",
          nextMilestone: "Beta Testing",
          teamSize: 4,
          fundingStatus: "seeking",
          fundingAmount: 50000,
        };

        const mockOpportunities: OpportunityData[] = [
          {
            id: "opp-001",
            title: "Google for Startups Program",
            description: "Access to Google Cloud credits and mentorship",
            category: "Program",
            deadline: "2026-04-15",
            priority: "high",
          },
          {
            id: "opp-002",
            title: "TechCrunch Startup Battlefield",
            description: "Pitch competition for $500K winners",
            category: "Competition",
            deadline: "2026-05-01",
            priority: "high",
          },
          {
            id: "opp-003",
            title: "VC Networking Event - Lagos",
            description: "Connect with angel investors and VCs",
            category: "Networking",
            deadline: "2026-03-25",
            priority: "medium",
          },
        ];

        setVentureData(mockVenture);
        setOpportunities(mockOpportunities);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load venture data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadVentureData();
    setIsVisible(true);
  }, [user]);

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

  if (!ventureData) {
    return (
      <Card className="p-8 text-center">
        <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No Venture Yet</h3>
        <p className="text-gray-400 mb-6">
          Create your first startup to unlock the full ImpactUni experience
        </p>
        <Button variant="primary" size="lg">
          Start a New Venture
        </Button>
      </Card>
    );
  }

  const stageColors = {
    ideation: "from-blue-500 to-blue-600",
    validation: "from-cyan-500 to-cyan-600",
    development: "from-primary-500 to-primary-600",
    launch: "from-green-500 to-green-600",
    growth: "from-purple-500 to-purple-600",
  };

  const stageBorderColors = {
    ideation: "border-blue-400",
    validation: "border-cyan-400",
    development: "border-primary-400",
    launch: "border-green-400",
    growth: "border-purple-400",
  };

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
            Your Venture Journey 🚀
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Track your startup progress, unlock opportunities, and scale your impact
          </p>
        </div>
      </div>

      {/* TOP ROW: Status, Next Action, Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Venture Stage - Status Card (Top Row) */}
        <KPICard
          icon={Lightbulb}
          label="Current Stage"
          value={ventureData.stage.charAt(0).toUpperCase() + ventureData.stage.slice(1)}
          status="Active"
          gradientFrom={stageColors[ventureData.stage].split(" ")[0]}
          gradientTo={stageColors[ventureData.stage].split(" ")[2]}
          borderColor={stageBorderColors[ventureData.stage]}
        />

        {/* Startup Progress - Next Action Card (Top Row) */}
        <ActionCard
          title="Next Milestone"
          description={ventureData.milestone}
          icon={Target}
          primaryAction={{
            label: "View Details",
            onClick: () => console.log("View milestone details"),
          }}
        />

        {/* Team & Funding - Progress Card (Top Row) */}
        <InsightCard
          title="Venture Overview"
          icon={TrendingUp}
          stats={[
            { label: "Team Size", value: ventureData.teamSize },
            { label: "Progress", value: `${ventureData.progress}%` },
            { label: "Status", value: ventureData.fundingStatus === "secured" ? "✓" : "○" },
          ]}
        >
          <p className="text-xs text-gray-400">
            {ventureData.fundingStatus === "seeking" && "Currently seeking funding"}
            {ventureData.fundingStatus === "secured" && "Funding secured"}
            {ventureData.fundingStatus === "not-started" && "Funding planning phase"}
          </p>
        </InsightCard>
      </div>

      {/* ROW 2: Additional cards limited to max 5 per dashboard */}

      {/* Learning & Labs - Action Card */}
      <ActionCard
        title="Learning & Labs"
        description="Access founder education, labs, and resources"
        icon={BookOpen}
        primaryAction={{
          label: "Explore Programs",
          onClick: () => console.log("Explore learning programs"),
        }}
        secondaryAction={{
          label: "Your Certificates",
          onClick: () => console.log("View certificates"),
        }}
      />

      {/* Opportunities - Opportunity Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white">Matching Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.slice(0, 2).map((opp) => (
            <OpportunityCard
              key={opp.id}
              title={opp.title}
              description={opp.description}
              category={opp.category}
              icon={Target}
              metadata={
                opp.deadline
                  ? [{ label: "Deadline", value: new Date(opp.deadline).toLocaleDateString() }]
                  : undefined
              }
              actionLabel="Learn More"
              onAction={() => console.log("View opportunity:", opp.id)}
              priority={opp.priority}
            />
          ))}
        </div>
      </div>

      {/* Mentor Access - Action Card */}
      <ActionCard
        title="Mentor Access"
        description="Connect with experienced mentors and get guidance on your venture"
        icon={Users}
        primaryAction={{
          label: "Find a Mentor",
          onClick: () => console.log("Access mentor network"),
        }}
        secondaryAction={{
          label: "Schedule Session",
          onClick: () => console.log("Schedule mentor session"),
        }}
        variant="success"
      />
    </div>
  );
}
