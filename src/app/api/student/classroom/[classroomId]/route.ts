import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { classroomId: string } }
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

    const classroomId = params.classroomId;

    // Check if classroom exists and is published
    const classroom = await prisma.course.findUnique({
      where: { id: classroomId },
      select: { id: true, isPublished: true, isArchived: true },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: 'Classroom not found' },
        { status: 404 }
      );
    }

    if (!classroom.isPublished) {
      return NextResponse.json(
        { error: 'Classroom is not available for enrollment' },
        { status: 403 }
      );
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: payload.sub,
          courseId: classroomId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this classroom' },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: payload.sub,
        courseId: classroomId,
        enrolledAt: new Date(),
        completionPercentage: 0,
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        enrolledAt: true,
        completionPercentage: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully enrolled in classroom',
        data: enrollment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error enrolling in classroom:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET specific classroom details for students
export async function GET(
  request: NextRequest,
  { params }: { params: { classroomId: string } }
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

    const classroomId = params.classroomId;

    // Check if student is enrolled
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

    // Get classroom details with modules and lessons
    const classroom = await prisma.course.findUnique({
      where: { id: classroomId },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        language: true,
        ageGroup: true,
        subjectStrand: true,
        estimatedDuration: true,
        instructor: true,
        modules: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            estimatedWeeks: true,
            lessons: {
              select: {
                id: true,
                title: true,
                description: true,
                learningLayer: true,
                duration: true,
                videoUrl: true,
                learningObjectives: true,
                facilitatorNotes: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: 'Classroom not found' },
        { status: 404 }
      );
    }

    // Get student progress
    const moduleProgress = await prisma.moduleProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...classroom,
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        completionPercentage: enrollment.completionPercentage,
        moduleProgress,
      },
    });
  } catch (error) {
    console.error('Error fetching classroom details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
