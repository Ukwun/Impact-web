import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

/**
 * GET /api/public/partners
 * Get all published partners (no authentication required)
 */
export async function GET(req: NextRequest) {
  try {
    const partners = await prisma.partner.findMany({
      where: { isPublished: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        category: true,
        logo: true,
        description: true,
      },
      orderBy: { category: "asc" },
    });

    const response = NextResponse.json({
      success: true,
      data: partners,
    });
    return addCorsHeaders(response, req.headers.get("origin") || undefined);
  } catch (error) {
    console.error("Error fetching partners:", error);

    // Return default partners if database fails
    const defaultPartners = [
      // Government
      { id: "1", name: "Federal Ministry of Education", category: "Government", logo: "FME", description: "" },
      {
        id: "2",
        name: "Ministry of Youth Development",
        category: "Government",
        logo: "MYD",
        description: "",
      },
      { id: "3", name: "FIRS Nigeria", category: "Government", logo: "FIRS", description: "" },

      // NGOs
      { id: "4", name: "BudgIT Foundation", category: "NGO", logo: "BI", description: "" },
      { id: "5", name: "Ashoka Africa", category: "NGO", logo: "AA", description: "" },
      { id: "6", name: "Ford Foundation", category: "NGO", logo: "FF", description: "" },
    ];

    const response = NextResponse.json({
      success: true,
      data: defaultPartners,
    });
    return addCorsHeaders(response, req.headers.get("origin") || undefined);
  }
}
