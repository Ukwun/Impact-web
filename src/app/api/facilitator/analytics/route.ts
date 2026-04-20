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
  const courseId = request.nextUrl.searchParams.get('courseId');

  try {
    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId parameter required' },
        { status: 400 }
      );
    }

    // Verify facilitator owns this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { createdBy: true, title: true },
    });

    if (!course || course.createdBy !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this course' },
        { status: 403 }
      );
    }

    // Get all enrollments in this course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: {
        id: true,
        student: { select: { id: true, name: true } },
        enrolledAt: true,
        status: true,
      },
    });

    // Get all submissions for this course
    const submissions = await prisma.submission.findMany({
      where: { courseId },
      select: {
        studentId: true,
        score: true,
        gradeStatus: true,
        submittedAt: true,
      },
    });

    // Calculate analytics
    const totalStudents = enrollments.length;
    const completionRate = enrollments.length > 0
      ? Math.round((enrollments.filter(e => e.status === 'completed').length / totalStudents) * 100)
      : 0;

    const gradedSubmissions = submissions.filter(s => s.gradeStatus === 'graded');
    const avgScore = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length)
      : 0;

    const submissionRate = totalStudents > 0
      ? Math.round((submissions.length / totalStudents) * 100)
      : 0;

    // Get top performers
    const studentScores = new Map<string, { name: string; score: number; count: number }>();
    submissions.forEach(sub => {
      if (!studentScores.has(sub.studentId)) {
        const student = enrollments.find(e => e.student.id === sub.studentId);
        studentScores.set(sub.studentId, {
          name: student?.student.name || 'Unknown',
          score: sub.score || 0,
          count: 1,
        });
      } else {
        const existing = studentScores.get(sub.studentId)!;
        existing.score += sub.score || 0;
        existing.count += 1;
      }
    });

    const topPerformers = Array.from(studentScores.values())
      .map(s => ({ ...s, avgScore: Math.round(s.score / s.count) }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);

    const needsSupport = Array.from(studentScores.values())
      .map(s => ({ ...s, avgScore: Math.round(s.score / s.count) }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3);

    return NextResponse.json({
      analytics: {
        courseTitle: course.title,
        totalStudents,
        completionRate,
        avgScore,
        submissionRate,
      },
      topPerformers,
      needsSupport,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
