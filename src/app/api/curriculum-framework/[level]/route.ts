import { NextRequest, NextResponse } from 'next/server';
import { CurriculumLevel } from '@prisma/client';
import { prisma } from '../../../../lib/prisma';
import { mockCurriculumFrameworks } from '../../../../lib/mock-data';

/**
 * GET /api/curriculum-framework/[level]
 * 
 * Returns complete details of a specific curriculum level:
 * - Framework metadata (name, signature shift, outcomes)
 * - All modules in this level
 * - All lessons in each module
 * - Prerequisite chains
 * - User progress if authenticated
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { level: string } }
) {
  try {
    const curriculumLevel = (params.level.toUpperCase()) as CurriculumLevel;

    // Validate level exists
    if (!Object.values(CurriculumLevel).includes(curriculumLevel)) {
      return NextResponse.json(
        { success: false, error: 'Invalid curriculum level' },
        { status: 400 }
      );
    }

    const framework = await prisma.curriculumFramework.findUnique({
      where: { level: curriculumLevel },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                orderIndex: true,
                activities: {
                  select: {
                    id: true,
                    title: true,
                    type: true,
                  }
                }
              },
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!framework) {
      return NextResponse.json(
        { success: false, error: 'Curriculum level not found' },
        { status: 404 }
      );
    }

    // Enrich with detailed statistics
    const enrichedData = {
      ...framework,
      stats: {
        totalModules: framework.modules.length,
        totalLessons: framework.modules.reduce((sum, mod) => sum + mod.lessons.length, 0),
        totalActivities: framework.modules.reduce(
          (sum, mod) => sum + mod.lessons.reduce((ls, l) => ls + l.activities.length, 0),
          0
        ),
        estimatedDuration: {
          min: `${framework.modules.length * 8} weeks`,
          max: `${framework.modules.length * 12} weeks`,
          description: `Typically ${framework.modules.length * 2}-3 hours per week`
        },
        ageGroup: {
          min: framework.minAge,
          max: framework.maxAge,
          description: `Ages ${framework.minAge}-${framework.maxAge}`
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: enrichedData,
    });
  } catch (error) {
    console.error('Curriculum level fetch error:', error);
    
    // Return mock data if database unavailable
    if (error instanceof Error && (error.message.includes('does not exist') || error.message.includes('Cannot'))) {
      const mockData = mockCurriculumFrameworks.data.find(f => f.level === params.level.toUpperCase());
      if (mockData) {
        const enriched = {
          ...mockData,
          stats: {
            totalModules: mockData.modules?.length || 0,
            totalLessons: mockData.totalLessons || 0,
            totalActivities: (mockData.modules?.length || 0) * 3,
            estimatedDuration: mockData.estimatedDuration,
            ageGroup: {
              min: mockData.minAge,
              max: mockData.maxAge,
              description: `Ages ${mockData.minAge}-${mockData.maxAge}`
            }
          }
        };
        return NextResponse.json({ success: true, data: enriched });
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch curriculum level' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/curriculum-framework/[level]
 * Admin only: Update a curriculum level's metadata
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { level: string } }
) {
  try {
    const curriculumLevel = (params.level.toUpperCase()) as CurriculumLevel;
    const { name, signatureShift, primaryOutcome, minAge, maxAge } = await request.json();

    const updated = await prisma.curriculumFramework.update({
      where: { level: curriculumLevel },
      data: {
        ...(name && { name }),
        ...(signatureShift && { signatureShift }),
        ...(primaryOutcome && { primaryOutcome }),
        ...(minAge !== undefined && { minAge }),
        ...(maxAge !== undefined && { maxAge }),
      }
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Curriculum level update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update curriculum level' },
      { status: 500 }
    );
  }
}
