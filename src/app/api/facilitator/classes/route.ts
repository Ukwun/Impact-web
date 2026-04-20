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
    // Get all courses taught by this facilitator
    const courses = await prisma.course.findMany({
      where: { createdBy: userId },
      select: { id: true, title: true },
    });

    const classData = [];

    // For each course, get enrolled students
    for (const course of courses) {
      const students = await prisma.enrollment.findMany({
        where: {
          courseId: course.id,
          status: 'active',
        },
        select: {
          id: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          enrolledAt: true,
          status: true,
        },
      });

      // Get grades for these students in this course
      const submissions = await prisma.submission.findMany({
        where: { courseId: course.id },
        select: {
          studentId: true,
          score: true,
        },
      });

      const submissionMap = new Map(
        submissions.map(sub => [sub.studentId, sub.score || 0])
      );

      classData.push({
        courseId: course.id,
        courseName: course.title,
        totalStudents: students.length,
        students: students.map(enrollment => ({
          id: enrollment.student.id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          enrolledAt: enrollment.enrolledAt,
          avgScore: submissionMap.get(enrollment.student.id) || 0,
        })),
      });
    }

    return NextResponse.json({ classes: classData });
  } catch (error) {
    console.error('Error fetching class rosters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class data' },
      { status: 500 }
    );
  }
}
