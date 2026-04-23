import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { PublishStatus, CurriculumEntityType } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// Only ADMIN can publish approved versions (applies snapshot to live entity)
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ["ADMIN"] as UserRole[]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const version = await prisma.curriculumVersion.findUnique({ where: { id } });
  if (!version) {
    return NextResponse.json({ success: false, error: "Version not found" }, { status: 404 });
  }

  if (version.status !== PublishStatus.APPROVED) {
    return NextResponse.json({ success: false, error: "Only approved versions can be published" }, { status: 400 });
  }

  const content = version.content as Record<string, unknown>;

  // Apply the version snapshot to the live entity
  const ops: Promise<unknown>[] = [
    prisma.curriculumVersion.update({
      where: { id },
      data: { status: PublishStatus.PUBLISHED, publishedAt: new Date() },
    }),
  ];

  if (version.entityType === CurriculumEntityType.MODULE) {
    ops.push(
      prisma.curriculumModule.update({
        where: { id: version.entityId },
        data: {
          publishStatus: PublishStatus.PUBLISHED,
          ...(content.title !== undefined && { title: content.title as string }),
          ...(content.description !== undefined && { description: content.description as string }),
          ...(content.subjectStrand !== undefined && { subjectStrand: content.subjectStrand as string }),
          ...(content.competencies !== undefined && { competencies: content.competencies as string[] }),
          ...(content.learningObjectives !== undefined && { learningObjectives: content.learningObjectives as string[] }),
        },
      })
    );
  } else if (version.entityType === CurriculumEntityType.LESSON) {
    ops.push(
      prisma.lesson.update({
        where: { id: version.entityId },
        data: {
          isPublished: true,
          ...(content.title !== undefined && { title: content.title as string }),
          ...(content.content !== undefined && { content: content.content as string }),
        },
      })
    );
  } else if (version.entityType === CurriculumEntityType.ACTIVITY) {
    ops.push(
      prisma.activity.update({
        where: { id: version.entityId },
        data: {
          ...(content.title !== undefined && { title: content.title as string }),
          ...(content.description !== undefined && { description: content.description as string }),
        },
      })
    );
  }

  await Promise.all(ops);

  return NextResponse.json({ success: true, message: "Version published and live entity updated" });
}
