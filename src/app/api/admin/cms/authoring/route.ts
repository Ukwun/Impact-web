import { NextRequest, NextResponse } from "next/server";
import { CurriculumLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import { seedLearningArchitectureCmsData } from "@/lib/learning-architecture-db";
import type { UserRole } from "@/lib/auth-service";

function parseJson<T>(value?: string | null, fallback?: T): T {
  if (!value) {
    return fallback as T;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback as T;
  }
}

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, ["ADMIN" as UserRole, "SCHOOL_ADMIN" as UserRole]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  await seedLearningArchitectureCmsData();

  const [programmes, levels, terms, modules, lessons, activities, courses] = await Promise.all([
    prisma.contentMetadata.findMany({ where: { resourceType: "PROGRAMME" }, orderBy: { title: "asc" } }),
    prisma.curriculumFramework.findMany({ orderBy: { minAge: "asc" } }),
    prisma.contentMetadata.findMany({ where: { resourceType: "TERM" }, orderBy: [{ curriculumLevel: "asc" }, { termOrCycle: "asc" }] }),
    prisma.curriculumModule.findMany({
      include: { framework: true },
      orderBy: [{ frameworkId: "asc" }, { order: "asc" }],
    }),
    prisma.lesson.findMany({
      include: {
        course: { select: { id: true, title: true } },
        curriculumModule: { select: { id: true, title: true, framework: { select: { level: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.activity.findMany({
      include: {
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.course.findMany({
      where: { isArchived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      programmes: programmes.map((item) => ({
        id: item.id,
        code: item.resourceId,
        title: item.title,
        description: item.shortDescription,
      })),
      levels: levels.map((level) => ({
        id: level.id,
        level: level.level,
        name: level.name,
        minAge: level.minAge,
        maxAge: level.maxAge,
        signatureShift: level.signatureShift,
        primaryOutcome: level.primaryOutcome,
      })),
      terms: terms.map((term) => {
        const details = parseJson<{ focus?: string; illustrativeTopics?: string[] }>(term.longDescription, {});
        return {
          id: term.id,
          level: term.curriculumLevel,
          term: term.termOrCycle,
          title: term.title,
          focus: details.focus ?? term.shortDescription,
          illustrativeTopics: details.illustrativeTopics ?? [],
        };
      }),
      modules: modules.map((module) => ({
        id: module.id,
        frameworkId: module.frameworkId,
        frameworkLevel: module.framework.level,
        title: module.title,
        description: module.description,
        order: module.order,
        subjectStrand: module.subjectStrand,
      })),
      lessons,
      activities,
      courses,
      levelOptions: Object.values(CurriculumLevel),
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await roleMiddleware(request, ["ADMIN" as UserRole, "SCHOOL_ADMIN" as UserRole]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const entityType = String(body.entityType ?? "").toUpperCase();

  if (!entityType) {
    return NextResponse.json({ success: false, error: "entityType is required" }, { status: 400 });
  }

  try {
    if (entityType === "PROGRAMME") {
      const code = String(body.code ?? "").toUpperCase();
      const title = String(body.title ?? "").trim();
      const description = String(body.description ?? "").trim();

      if (!code || !title) {
        return NextResponse.json({ success: false, error: "code and title are required" }, { status: 400 });
      }

      const existing = await prisma.contentMetadata.findFirst({
        where: { resourceType: "PROGRAMME", resourceId: code },
      });

      const record = existing
        ? await prisma.contentMetadata.update({
            where: { id: existing.id },
            data: {
              title,
              shortDescription: description,
              isPublished: true,
            },
          })
        : await prisma.contentMetadata.create({
            data: {
              title,
              shortDescription: description,
              resourceType: "PROGRAMME",
              resourceId: code,
              contentType: "PROGRAMME",
              isPublished: true,
              publishedAt: new Date(),
            },
          });

      return NextResponse.json({ success: true, data: record }, { status: 201 });
    }

    if (entityType === "LEVEL") {
      const level = String(body.level ?? "").toUpperCase() as CurriculumLevel;
      const name = String(body.name ?? "").trim();
      const signatureShift = String(body.signatureShift ?? "").trim();
      const primaryOutcome = String(body.primaryOutcome ?? "").trim();
      const minAge = Number(body.minAge ?? 0);
      const maxAge = Number(body.maxAge ?? 100);

      if (!Object.values(CurriculumLevel).includes(level)) {
        return NextResponse.json({ success: false, error: "Invalid curriculum level" }, { status: 400 });
      }

      const created = await prisma.curriculumFramework.upsert({
        where: { level },
        update: {
          name,
          signatureShift,
          primaryOutcome,
          minAge,
          maxAge,
        },
        create: {
          level,
          name,
          signatureShift,
          primaryOutcome,
          minAge,
          maxAge,
          durationWeeks: Number(body.durationWeeks ?? 12),
        },
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (entityType === "TERM") {
      const level = String(body.level ?? "").toUpperCase() as CurriculumLevel;
      const term = String(body.term ?? "").trim();
      const focus = String(body.focus ?? "").trim();
      const illustrativeTopics = Array.isArray(body.illustrativeTopics) ? body.illustrativeTopics : [];

      if (!Object.values(CurriculumLevel).includes(level) || !term) {
        return NextResponse.json({ success: false, error: "level and term are required" }, { status: 400 });
      }

      const resourceId = `${level}_${term.replace(/[^a-zA-Z0-9]+/g, "_")}`;
      const existing = await prisma.contentMetadata.findFirst({
        where: { resourceType: "TERM", resourceId },
      });

      const record = existing
        ? await prisma.contentMetadata.update({
            where: { id: existing.id },
            data: {
              title: term,
              shortDescription: focus,
              curriculumLevel: level,
              termOrCycle: term,
              longDescription: JSON.stringify({ focus, illustrativeTopics }),
            },
          })
        : await prisma.contentMetadata.create({
            data: {
              title: term,
              shortDescription: focus,
              curriculumLevel: level,
              termOrCycle: term,
              longDescription: JSON.stringify({ focus, illustrativeTopics }),
              resourceType: "TERM",
              resourceId,
              contentType: "TERM",
              isPublished: true,
              publishedAt: new Date(),
            },
          });

      return NextResponse.json({ success: true, data: record }, { status: 201 });
    }

    if (entityType === "MODULE") {
      const frameworkId = String(body.frameworkId ?? "");
      const title = String(body.title ?? "").trim();
      const description = String(body.description ?? "").trim();
      const subjectStrand = String(body.subjectStrand ?? "General").trim();
      const order = Number(body.order ?? 1);

      if (!frameworkId || !title) {
        return NextResponse.json({ success: false, error: "frameworkId and title are required" }, { status: 400 });
      }

      const created = await prisma.curriculumModule.create({
        data: {
          frameworkId,
          title,
          description,
          order,
          subjectStrand,
          estimatedWeeks: Number(body.estimatedWeeks ?? 4),
          competencies: Array.isArray(body.competencies) ? body.competencies : [],
          learningObjectives: Array.isArray(body.learningObjectives) ? body.learningObjectives : [],
        },
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (entityType === "LESSON") {
      const courseId = String(body.courseId ?? "");
      const curriculumModuleId = String(body.curriculumModuleId ?? "") || null;
      const moduleId = String(body.moduleId ?? "") || null;
      const title = String(body.title ?? "").trim();
      const description = String(body.description ?? "").trim();
      const order = Number(body.order ?? 1);
      const duration = Number(body.duration ?? 20);

      if (!courseId || !title) {
        return NextResponse.json({ success: false, error: "courseId and title are required" }, { status: 400 });
      }

      const created = await prisma.lesson.create({
        data: {
          courseId,
          curriculumModuleId,
          moduleId,
          title,
          description,
          order,
          duration,
          learningLayer: String(body.learningLayer ?? "LEARN"),
          learningObjectives: Array.isArray(body.learningObjectives) ? body.learningObjectives : [],
        },
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (entityType === "ACTIVITY") {
      const courseId = String(body.courseId ?? "");
      const moduleId = String(body.moduleId ?? "") || null;
      const lessonId = String(body.lessonId ?? "") || null;
      const title = String(body.title ?? "").trim();
      const description = String(body.description ?? "").trim();

      if (!courseId || !title) {
        return NextResponse.json({ success: false, error: "courseId and title are required" }, { status: 400 });
      }

      const created = await prisma.activity.create({
        data: {
          courseId,
          moduleId,
          lessonId,
          title,
          description,
          instructions: String(body.instructions ?? "").trim() || null,
          activityType: String(body.activityType ?? "WORKSHEET"),
          order: Number(body.order ?? 0),
          maxPoints: Number(body.maxPoints ?? 100),
        },
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: "Unsupported entityType" }, { status: 400 });
  } catch (error) {
    console.error("CMS authoring create failed", error);
    return NextResponse.json({ success: false, error: "Failed to create authoring entity" }, { status: 500 });
  }
}
