import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { PublishStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// Only ADMIN can approve/reject versions
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ["ADMIN"] as UserRole[]);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { id } = await params;
  const body = await request.json();
  const { decision, comment } = body; // decision: "APPROVE" | "REJECT"

  if (!decision || !["APPROVE", "REJECT"].includes(decision)) {
    return NextResponse.json({ success: false, error: "decision must be APPROVE or REJECT" }, { status: 400 });
  }

  const version = await prisma.curriculumVersion.findUnique({
    where: { id },
    include: { approvalRequest: true },
  });

  if (!version) {
    return NextResponse.json({ success: false, error: "Version not found" }, { status: 404 });
  }

  if (version.status !== PublishStatus.PENDING_REVIEW) {
    return NextResponse.json({ success: false, error: "Version is not pending review" }, { status: 400 });
  }

  const newStatus = decision === "APPROVE" ? PublishStatus.APPROVED : PublishStatus.DRAFT;

  const ops = [
    prisma.curriculumVersion.update({
      where: { id },
      data: {
        status: newStatus,
        reviewerId: user.userId,
        reviewedAt: new Date(),
        reviewerComment: comment,
      },
    }),
  ];

  if (version.approvalRequest) {
    ops.push(
      prisma.approvalRequest.update({
        where: { id: version.approvalRequest.id },
        data: {
          status: newStatus,
          reviewedById: user.userId,
          reviewNotes: comment,
          reviewedAt: new Date(),
        },
      }) as unknown as typeof ops[0]
    );
  }

  const [updatedVersion] = await prisma.$transaction(ops);

  return NextResponse.json({ success: true, data: updatedVersion, decision });
}
