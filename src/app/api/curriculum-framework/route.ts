import { NextRequest, NextResponse } from 'next/server';
import { CurriculumLevel } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { mockCurriculumFrameworks } from '../../../lib/mock-data';

/**
 * GET /api/curriculum-framework
 * 
 * Returns all curriculum levels with their modules and statistics
 * Falls back to mock data if database is unavailable
 */
export async function GET(request: NextRequest) {
  try {
    // Get all curriculum frameworks with their modules
    const frameworks = await prisma.curriculumFramework.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                duration: true,
              }
            }
          }
        }
      },
      orderBy: {
        level: 'asc'
      }
    });

    // Enrich with statistics
    const enrichedFrameworks = frameworks.map(framework => ({
      ...framework,
      moduleCount: framework.modules.length,
      totalLessons: framework.modules.reduce((sum, mod) => sum + mod.lessons.length, 0),
      estimatedDuration: `${framework.modules.length * 8}-${framework.modules.length * 12} weeks`,
    }));

    return NextResponse.json({
      success: true,
      count: enrichedFrameworks.length,
      data: enrichedFrameworks,
    });
  } catch (error) {
    console.error('Curriculum Framework fetch error:', error);
    
    // Return mock data if database unavailable (for realistic development)
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('Database tables not yet migrated - returning mock data');
      return NextResponse.json(mockCurriculumFrameworks);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch curriculum frameworks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/curriculum-framework
 * Admin only: Create a new curriculum framework level
 */
export async function POST(request: NextRequest) {
  try {
    const { level, name, signatureShift, primaryOutcome, minAge, maxAge } = await request.json();

    // Validate required fields
    if (!level || !name || !signatureShift || !primaryOutcome) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if level already exists
    const existing = await prisma.curriculumFramework.findUnique({
      where: { level: level as CurriculumLevel }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Curriculum level already exists' },
        { status: 409 }
      );
    }

    const newFramework = await prisma.curriculumFramework.create({
      data: {
        level: level as CurriculumLevel,
        name,
        signatureShift,
        primaryOutcome,
        minAge: minAge || 0,
        maxAge: maxAge || 100,
      }
    });

    return NextResponse.json({
      success: true,
      data: newFramework,
    }, { status: 201 });
  } catch (error) {
    console.error('Curriculum Framework creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create curriculum framework' },
      { status: 500 }
    );
  }
}
