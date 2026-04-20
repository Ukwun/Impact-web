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
    // Get all pending submissions for courses taught by this facilitator
    const submissions = await prisma.submission.findMany({
      where: {
        course: { createdBy: userId },
        gradeStatus: 'pending',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const formattedSubmissions = submissions.map(sub => ({
      id: sub.id,
      studentId: sub.student.id,
      studentName: sub.student.name,
      courseId: sub.course.id,
      courseTitle: sub.course.title,
      lessonId: sub.lesson?.id,
      lessonTitle: sub.lesson?.title || 'Assignment',
      submittedAt: sub.submittedAt,
      content: sub.content,
      attachmentUrl: sub.attachmentUrl,
      status: 'pending',
    }));

    return NextResponse.json({ submissions: formattedSubmissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
