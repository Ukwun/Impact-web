import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

/**
 * GET /api/public/testimonials
 * Fetch published testimonials for the landing page
 * This endpoint is PUBLIC (no authentication required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "3");
    const category = searchParams.get("category"); // Optional: filter by category

    let where: any = {
      isPublished: true,
    };

    if (category) {
      where.category = category;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      select: {
        id: true,
        authorName: true,
        authorRole: true,
        quote: true,
        rating: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // If not enough testimonials in database, return what we have
    if (testimonials.length === 0) {
      // Return empty array - component will handle gracefully
      const response = NextResponse.json({
        success: true,
        data: [],
      });
      return addCorsHeaders(response, request.headers.get("origin") || undefined);
    }

    const response = NextResponse.json({
      success: true,
      data: testimonials,
    });
    return addCorsHeaders(response, request.headers.get("origin") || undefined);
  } catch (error) {
    console.error("❌ Error fetching testimonials:", error);
    const response = NextResponse.json(
      {
        success: false,
        error: "Failed to fetch testimonials",
      },
      { status: 500 }
    );
    return addCorsHeaders(response, request.headers.get("origin") || undefined);
  }
}
