import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/testimonials
 * Fetch all published testimonials
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");

    // Build filter query
    const where: any = {
      isPublished: true,
    };

    if (category && category !== "all") {
      where.category = category.toLowerCase();
    }

    // Fetch testimonials
    const testimonials = await prisma.testimonial.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        testimonials: testimonials,
      },
    });
  } catch (error) {
    console.error("Fetch testimonials error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/testimonials
 * Create a new testimonial
 */
export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    // Optionally: verify token (import verifyToken from @/lib/auth)
    // If you want to check the user, uncomment below:
    // import { verifyToken } from "@/lib/auth";
    // const user = verifyToken(token);
    // if (!user) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { authorName, authorRole, quote, rating, category } = body;

    if (!authorName || !quote || !category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        authorName,
        authorRole: authorRole || "",
        quote,
        rating: rating || 5,
        category: category.toLowerCase(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Testimonial created successfully",
        data: { testimonial },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create testimonial error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
