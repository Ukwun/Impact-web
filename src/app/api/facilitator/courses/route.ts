import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'FACILITATOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = payload.userId;

  try {
    // Get all courses created by this facilitator
    const courses = await prisma.course.findMany({
      where: { createdBy: userId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        level: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: { where: { status: 'active' } },
            submissions: { where: { gradeStatus: 'pending' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      createdAt: course.createdAt,
      totalStudents: course._count.enrollments,
      pendingGrades: course._count.submissions,
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
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'FACILITATOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = payload.userId;

  try {
    const { title, description, category, level, capacity, lessons } = await request.json();

    if (!title || !lessons || lessons.length === 0) {
      return NextResponse.json(
        { error: 'Title and lessons are required' },
        { status: 400 }
      );
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level,
        capacity: capacity || 30,
        createdBy: userId,
        status: 'published',
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
          dueDate: lesson.dueDate ? new Date(lesson.dueDate) : null,
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
