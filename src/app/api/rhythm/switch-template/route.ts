import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth-service";
import { switchRhythmTemplate } from "@/lib/rhythm-db";

export async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const body = await request.json();
  const { templateId } = body;

  if (!templateId || typeof templateId !== "string") {
    return NextResponse.json(
      { success: false, error: "templateId is required" },
      { status: 400 }
    );
  }

  const updated = await switchRhythmTemplate(authResult.user.userId, templateId);

  return NextResponse.json({
    success: true,
    message: "Template switched successfully",
    data: {
      userId: authResult.user.userId,
      currentTemplate: updated.currentTemplateId,
      updatedAt: updated.updatedAt,
    },
  });
}
