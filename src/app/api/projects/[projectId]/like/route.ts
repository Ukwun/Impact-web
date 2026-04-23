import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return NextResponse.json({
    success: true,
    message: "Project like updated",
    data: {
      projectId: params.projectId,
      userId: authResult.user.id,
      updatedAt: new Date().toISOString(),
    },
  });
}
