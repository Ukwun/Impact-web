import { NextRequest, NextResponse } from "next/server";
import { CurriculumLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

export async function PUT(
  request: NextRequest,
  { params }: { params: { entityType: string; id: string } }
) {
  const auth = await roleMiddleware(request, ["ADMIN" as UserRole, "SCHOOL_ADMIN" as UserRole]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const entityType = params.entityType.toUpperCase();
  const id = params.id;

  try {
    if (entityType === "PROGRAMME" || entityType === "TERM") {
      const longDescription =
        entityType === "TERM"
          ? JSON.stringify({
              focus: body.focus ?? body.shortDescription ?? "",
              illustrativeTopics: Array.isArray(body.illustrativeTopics) ? body.illustrativeTopics : [],
            })
          : body.longDescription;

      const record = await prisma.contentMetadata.update({
        where: { id },
        data: {
          title: body.title,
          shortDescription: body.shortDescription,
          termOrCycle: body.termOrCycle,
          curriculumLevel: body.curriculumLevel as CurriculumLevel | null,
          longDescription: longDescription ?? null,
        },
      });

      return NextResponse.json({ success: true, data: record });
    }

    if (entityType === "LEVEL") {
      const record = await prisma.curriculumFramework.update({
        where: { id },
        data: {
          name: body.name,
          minAge: Number(body.minAge),
          maxAge: Number(body.maxAge),
          signatureShift: body.signatureShift,
          primaryOutcome: body.primaryOutcome,
          durationWeeks: Number(body.durationWeeks ?? 12),
        },
      });

      return NextResponse.json({ success: true, data: record });
    }

    if (entityType === "MODULE") {
      const record = await prisma.curriculumModule.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          order: Number(body.order ?? 1),
          subjectStrand: body.subjectStrand,
          estimatedWeeks: Number(body.estimatedWeeks ?? 4),
          competencies: Array.isArray(body.competencies) ? body.competencies : [],
          learningObjectives: Array.isArray(body.learningObjectives) ? body.learningObjectives : [],
        },
      });

      return NextResponse.json({ success: true, data: record });
    }

    if (entityType === "LESSON") {
      const record = await prisma.lesson.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          duration: Number(body.duration ?? 20),
          order: Number(body.order ?? 1),
          learningLayer: body.learningLayer,
          learningObjectives: Array.isArray(body.learningObjectives) ? body.learningObjectives : [],
          courseId: body.courseId,
          moduleId: body.moduleId || null,
          curriculumModuleId: body.curriculumModuleId || null,
        },
      });

      return NextResponse.json({ success: true, data: record });
    }

    if (entityType === "ACTIVITY") {
      const record = await prisma.activity.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          instructions: body.instructions,
          activityType: body.activityType,
          maxPoints: Number(body.maxPoints ?? 100),
          order: Number(body.order ?? 0),
          courseId: body.courseId,
          moduleId: body.moduleId || null,
          lessonId: body.lessonId || null,
        },
      });

      return NextResponse.json({ success: true, data: record });
    }

    return NextResponse.json({ success: false, error: "Unsupported entity type" }, { status: 400 });
  } catch (error) {
    console.error("CMS authoring update failed", error);
    return NextResponse.json({ success: false, error: "Failed to update entity" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { entityType: string; id: string } }
) {
  const auth = await roleMiddleware(request, ["ADMIN" as UserRole, "SCHOOL_ADMIN" as UserRole]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const entityType = params.entityType.toUpperCase();
  const id = params.id;

  try {
    if (entityType === "PROGRAMME" || entityType === "TERM") {
      await prisma.contentMetadata.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (entityType === "LEVEL") {
      await prisma.curriculumFramework.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (entityType === "MODULE") {
      await prisma.curriculumModule.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (entityType === "LESSON") {
      await prisma.lesson.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (entityType === "ACTIVITY") {
      await prisma.activity.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unsupported entity type" }, { status: 400 });
  } catch (error) {
    console.error("CMS authoring delete failed", error);
    return NextResponse.json({ success: false, error: "Failed to delete entity" }, { status: 500 });
  }
}
