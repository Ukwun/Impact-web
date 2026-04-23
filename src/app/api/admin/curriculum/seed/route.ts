import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { seedSeniorSecondaryAndImpactUniCurriculum } from "@/lib/venture-lab-seed";

export async function POST(request: NextRequest) {
  const auth = await roleMiddleware(request, ["ADMIN"] as UserRole[]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const summary = await seedSeniorSecondaryAndImpactUniCurriculum(prisma);

  return NextResponse.json({
    success: true,
    message: "Senior Secondary and ImpactUni curriculum seeded successfully",
    data: summary,
  });
}