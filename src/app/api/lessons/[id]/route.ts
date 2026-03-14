import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/lessons/[id]
 * Fetch lesson details with materials
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        materials: true,
        course: {
          select: {
            id: true,
            title: true,
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    const lessonResponse = {
      id: lesson.id,
      courseId: lesson.courseId,
      courseName: lesson.course.title,
      instructor: lesson.course.createdBy ? `${lesson.course.createdBy.firstName} ${lesson.course.createdBy.lastName}` : 'Unknown Instructor',
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      videoThumbnail: lesson.videoThumbnail,
      duration: lesson.duration,
      materials: lesson.materials.map((m: any) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        url: m.url,
        fileSize: m.fileSize,
      })),
      createdAt: lesson.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: lessonResponse,
    });
  } catch (error) {
    console.error("Fetch lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}
