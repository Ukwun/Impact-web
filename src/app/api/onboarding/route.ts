import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      role,
      location,
      institution,
      educationLevel,
      interests,
      learningGoals,
      learningPace,
      skillLevel,
      notificationFrequency,
      teachingSubjects,
      classSize,
      teachingDays,
      childId,
      monitoringInterests,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    console.log("💾 Onboarding API: Saving preferences for user", userId, "role", role);

    // Build preferences object based on role
    const preferences: Record<string, any> = {
      role,
      location,
      institution,
      completedAt: new Date().toISOString(),
    };

    if (role === "student") {
      preferences.educationLevel = educationLevel;
      preferences.interests = interests;
      preferences.learningGoals = learningGoals;
      preferences.learningPace = learningPace;
      preferences.skillLevel = skillLevel;
      preferences.notificationFrequency = notificationFrequency;
    } else if (role === "facilitator") {
      preferences.teachingSubjects = teachingSubjects;
      preferences.classSize = classSize;
      preferences.teachingDays = teachingDays;
    } else if (role === "parent") {
      preferences.childId = childId;
      preferences.monitoringInterests = monitoringInterests;
    }

    // Try to update user in database (if not a demo user)
    let updatedUser = null;
    try {
      // Only try to update if user ID doesn't look like a demo ID
      if (!userId.startsWith("user-")) {
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            institution: institution || undefined,
            verified: true, // Mark user as verified after onboarding
          },
        });
        console.log("✅ User updated in database:", userId);
      } else {
        console.log("ℹ️ Demo user - skipping database update");
      }
    } catch (err: any) {
      // User might not exist in database (demo mode scenario)
      if (err.code === "P2025") {
        console.log("⚠️ User not found in database (likely demo mode) - storing preferences only");
      } else {
        console.error("❌ Database error:", err.message);
      }
    }

    // Try to store onboarding response
    let onboarding = null;
    try {
      if (!userId.startsWith("user-")) {
        onboarding = await (prisma as any).onboardingResponse.upsert({
          where: { userId },
          update: { preferences },
          create: { userId, role, preferences },
        });
        console.log("✅ Onboarding response saved:", userId);
      }
    } catch (err) {
      // Table might not exist or user not in database
      console.log("ℹ️ OnboardingResponse not saved (demo mode or table missing)");
    }

    console.log("✅ Onboarding data accepted:", {
      userId,
      role,
      location,
      institution,
      preferencesKeys: Object.keys(preferences),
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        user: updatedUser,
        preferences,
        onboarding,
      },
    });
  } catch (error) {
    console.error("❌ Onboarding API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save onboarding",
      },
      { status: 500 }
    );
  }
}
