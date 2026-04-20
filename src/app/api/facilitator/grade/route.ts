import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const { submissionId, score, feedback } = await request.json();

    if (!submissionId || score === undefined || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Verify that submission belongs to a course taught by this facilitator
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { course: { select: { createdBy: true } } },
    });

    if (!submission || submission.course.createdBy !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to grade this submission' },
        { status: 403 }
      );
    }

    // Update submission with grade
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
        gradeStatus: 'graded',
        gradedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: 'Submission graded successfully',
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json(
      { error: 'Failed to grade submission' },
      { status: 500 }
    );
  }
}
