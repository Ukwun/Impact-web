import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const ADMIN_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, ADMIN_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const users = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SCHOOL_ADMIN", "FACILITATOR", "MENTOR"] },
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
    take: 200,
  });

  return NextResponse.json({
    success: true,
    data: users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    })),
  });
}
