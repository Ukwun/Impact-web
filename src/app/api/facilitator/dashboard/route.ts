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
    // Get courses created by this facilitator
    const coursesTaught = await prisma.course.count({
      where: { createdBy: userId },
    });

    // Get total students across all their courses
    const totalStudents = await prisma.enrollment.count({
      where: {
        course: { createdBy: userId },
        status: 'active',
      },
    });

    // Get pending submissions
    const pendingSubmissions = await prisma.submission.count({
      where: {
        course: { createdBy: userId },
        gradeStatus: 'pending',
      },
    });

    // Get average class grade
    const grades = await prisma.submission.findMany({
      where: {
        course: { createdBy: userId },
        gradeStatus: 'graded',
      },
      select: { score: true },
    });

    const avgGrade =
      grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length)
        : 0;

    // Get recent submissions (last 5)
    const recentSubmissions = await prisma.submission.findMany({
      where: {
        course: { createdBy: userId },
      },
      include: {
        student: true,
        course: true,
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      teachingMetrics: {
        coursesTaught,
        totalStudents,
        pendingSubmissions,
        avgClassGrade: avgGrade,
      },
      recentSubmissions: recentSubmissions.map(sub => ({
        id: sub.id,
        studentName: sub.student?.name || 'Unknown',
        courseName: sub.course?.title || 'Unknown',
        submittedAt: sub.submittedAt,
        status: sub.gradeStatus,
      })),
    });
  } catch (error) {
    console.error('Error fetching facilitator dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
