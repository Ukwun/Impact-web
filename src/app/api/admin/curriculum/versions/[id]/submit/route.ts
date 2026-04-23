import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { PublishStatus } from "@prisma/client";

const ALLOWED_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

type Params = { params: Promise<{ id: string }> };

// Submit a draft version for review
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { id } = await params;
  const body = await request.json();

  const version = await prisma.curriculumVersion.findUnique({
    where: { id },
    include: { approvalRequest: true },
  });

  if (!version) {
    return NextResponse.json({ success: false, error: "Version not found" }, { status: 404 });
  }

  if (version.authorId !== user.userId && user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden: Only the author or an admin can submit this version" }, { status: 403 });
  }

  if (version.status !== PublishStatus.DRAFT) {
    return NextResponse.json({ success: false, error: `Cannot submit: version is already ${version.status}` }, { status: 400 });
  }

  // Update version status and create approval request
  const [updatedVersion] = await prisma.$transaction([
    prisma.curriculumVersion.update({
      where: { id },
      data: { status: PublishStatus.PENDING_REVIEW },
    }),
    version.approvalRequest
      ? prisma.approvalRequest.update({
          where: { id: version.approvalRequest.id },
          data: {
            status: PublishStatus.PENDING_REVIEW,
            requestNotes: body.notes,
            requestedAt: new Date(),
          },
        })
      : prisma.approvalRequest.create({
          data: {
            versionId: id,
            requestedById: user.userId,
            status: PublishStatus.PENDING_REVIEW,
            requestNotes: body.notes,
          },
        }),
  ]);

  return NextResponse.json({ success: true, data: updatedVersion });
}
