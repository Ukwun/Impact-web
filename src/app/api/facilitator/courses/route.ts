import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'FACILITATOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = payload.sub;

  try {
    // Get all courses created by this facilitator
    const courses = await prisma.course.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        language: true,
        instructor: true,
        isPublished: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            grades: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      language: course.language,
      instructor: course.instructor,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      totalStudents: course._count.enrollments,
      totalGrades: course._count.grades,
    }));

    return NextResponse.json({ courses: formattedCourses });
  } catch (error) {
    console.error('Error fetching facilitator courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'FACILITATOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = payload.sub;

  try {
    const { title, description, difficulty, language, instructor, lessons } = await request.json();

    if (!title || !lessons || lessons.length === 0 || !instructor) {
      return NextResponse.json(
        { error: 'Title, instructor, and lessons are required' },
        { status: 400 }
      );
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        difficulty: difficulty || 'BEGINNER',
        language: language || 'English',
        instructor,
        createdById: userId,
        isPublished: true,
      },
    });

    // Create lessons
    for (const lesson of lessons) {
      await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          duration: lesson.duration || 60,
        },
      });
    }

    return NextResponse.json({ course, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
