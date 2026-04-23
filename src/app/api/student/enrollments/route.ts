import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET student's enrolled classrooms
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: payload.sub },
      select: {
        id: true,
        courseId: true,
        enrolledAt: true,
        completionPercentage: true,
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            subjectStrand: true,
            ageGroup: true,
            thumbnail: true,
            instructor: true,
            modules: {
              select: {
                id: true,
                lessons: {
                  select: { id: true, learningLayer: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    const data = enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      );

      return {
        id: enrollment.id,
        courseId: enrollment.courseId,
        title: enrollment.course.title,
        description: enrollment.course.description,
        difficulty: enrollment.course.difficulty,
        subjectStrand: enrollment.course.subjectStrand,
        ageGroup: enrollment.course.ageGroup,
        thumbnail: enrollment.course.thumbnail,
        instructor: enrollment.course.instructor,
        completionPercentage: enrollment.completionPercentage,
        enrolledAt: enrollment.enrolledAt,
        moduleCount: enrollment.course.modules.length,
        lessonCount: totalLessons,
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
