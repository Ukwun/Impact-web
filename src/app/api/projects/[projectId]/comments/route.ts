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

  const body = await request.json();
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json(
      { success: false, error: "Comment text is required" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Comment posted",
      data: {
        id: `comment-${Date.now()}`,
        projectId: params.projectId,
        authorId: authResult.user.id,
        text,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}
