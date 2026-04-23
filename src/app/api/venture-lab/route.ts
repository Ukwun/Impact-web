import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/lib/auth-service";
import { CurriculumLevel } from "@prisma/client";

const VENTURE_ACTIVITY_TYPES = [
  "BUSINESS_PLAN",
  "PROJECTION_WORKSHEET",
  "INVESTOR_SIMULATION",
  "CAPSTONE_PITCH",
];

function parseJsonValue<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const userId = auth.user.userId;

  const activities = await prisma.activity.findMany({
    where: {
      isPublished: true,
      activityType: { in: VENTURE_ACTIVITY_TYPES },
      lesson: {
        curriculumModule: {
          framework: {
            level: { in: [CurriculumLevel.SENIOR_SECONDARY, CurriculumLevel.IMPACTUNI] },
          },
        },
      },
    },
    include: {
      lesson: {
        include: {
          curriculumModule: {
            include: {
              framework: true,
            },
          },
        },
      },
      submissions: {
        where: { userId },
      },
    },
    orderBy: [{ dueDate: "asc" }, { order: "asc" }],
  });

  const metadata = await prisma.contentMetadata.findMany({
    where: {
      resourceType: "ACTIVITY",
      resourceId: { in: activities.map((activity) => activity.id) },
    },
  });

  const metadataById = new Map(metadata.map((item) => [item.resourceId, item]));

  const artifacts = activities.map((activity) => {
    const submission = activity.submissions[0] ?? null;
    const meta = metadataById.get(activity.id);
    const rubricCriteria = parseJsonValue<Array<{ criterion: string; points: number; description: string }>>(activity.rubric, []);
    const response = submission ? parseJsonValue<Record<string, unknown>>(submission.content, {}) : {};

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      instructions: activity.instructions,
      activityType: activity.activityType,
      dueDate: activity.dueDate,
      maxPoints: activity.maxPoints,
      rubricCriteria,
      level: activity.lesson?.curriculumModule?.framework.level,
      frameworkName: activity.lesson?.curriculumModule?.framework.name,
      moduleTitle: activity.lesson?.curriculumModule?.title,
      lessonTitle: activity.lesson?.title,
      workflowUrl: meta?.applyComponentUrl ?? activity.attachments[0] ?? "/dashboard/venture",
      shortDescription: meta?.shortDescription ?? activity.description,
      submission: submission
        ? {
            id: submission.id,
            isSubmitted: submission.isSubmitted,
            submittedAt: submission.submittedAt,
            score: submission.score,
            feedback: submission.feedback,
            response,
          }
        : null,
    };
  });

  const submittedCount = artifacts.filter((artifact) => artifact.submission?.isSubmitted).length;

  return NextResponse.json({
    success: true,
    data: {
      artifacts,
      summary: {
        total: artifacts.length,
        submitted: submittedCount,
        pending: artifacts.length - submittedCount,
        levels: Array.from(new Set(artifacts.map((artifact) => artifact.level).filter(Boolean))),
      },
    },
  });
}