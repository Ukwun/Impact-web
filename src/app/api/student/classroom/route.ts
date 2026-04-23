import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Get all published classrooms (available for enrollment)
    const classrooms = await prisma.course.findMany({
      where: {
        isPublished: true,
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        language: true,
        ageGroup: true,
        subjectStrand: true,
        thumbnail: true,
        createdAt: true,
        instructor: true,
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Enrich with enrollment count and available modules count
    const enriched = classrooms.map((classroom) => ({
      ...classroom,
      enrolledCount: classroom._count.enrollments,
      modulesCount: classroom._count.modules,
      _count: undefined, // Remove internal count object
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
