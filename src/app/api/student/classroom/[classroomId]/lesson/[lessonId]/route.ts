import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mark lesson as watched and update progress
export async function POST(
  request: NextRequest,
  { params }: { params: { classroomId: string; lessonId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { classroomId, lessonId } = params;
    const { completed } = await request.json();

    // Verify student is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: payload.sub,
          courseId: classroomId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this classroom' },
        { status: 403 }
      );
    }

    // Get lesson and its module
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        moduleId: true,
        learningLayer: true,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Create or update lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: lessonId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId: lessonId,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
        watchedAt: new Date(),
      },
      update: {
        completed: completed || false,
        completedAt: completed ? new Date() : undefined,
        watchedAt: new Date(),
      },
    });

    // Calculate overall progress for the enrollment
    const allLessons = await prisma.lesson.findMany({
      where: {
        module: {
          courseId: classroomId,
        },
      },
      select: { id: true },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
    });

    const completionPercentage = Math.round(
      (completedLessons / allLessons.length) * 100
    );

    // Update enrollment completion percentage
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { completionPercentage },
    });

    return NextResponse.json({
      success: true,
      data: {
        progress,
        enrollmentCompletionPercentage: completionPercentage,
      },
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
