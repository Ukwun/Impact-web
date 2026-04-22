import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "UNI_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get available opportunities
    const opportunities = await prisma.opportunity.findMany({
      where: {
        AND: [
          { type: { in: ["SCHOLARSHIP", "CAREER", "INTERNSHIP"] } },
          { deadline: { gte: new Date() } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        deadline: true,
        provider: true,
        qualifications: true,
      },
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: opportunities.map((opp) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        type: opp.type.toLowerCase(),
        deadline: opp.deadline.toISOString(),
        provider: opp.provider,
        qualifications: opp.qualifications,
        daysLeft: Math.ceil(
          (opp.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "UNI_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { opportunityId, action } = await request.json();
    const userId = payload.sub;

    if (action === "apply") {
      // Create application
      const application = await prisma.opportunityApplication.create({
        data: {
          opportunityId,
          userId,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Application submitted",
        application,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error applying to opportunity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
