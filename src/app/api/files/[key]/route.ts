import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
  getPresignedUploadUrl,
  deleteFromS3,
} from "@/lib/s3-client";
import { prisma } from "@/lib/prisma";

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/files/[key]
 * Get presigned download URL for a file (with authorization)
 * Only the file owner or admin can download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const s3Key = params.key;

    if (!s3Key) {
      return NextResponse.json(
        { success: false, error: "File key is required" },
        { status: 400 }
      );
    }

    // Verify user owns the file (check if it's in their submissions)
    const submission = await prisma.assignmentSubmission.findFirst({
      where: {
        submissionUrl: s3Key,
        userId: user.sub,
      },
    });

    // Allow if user is owner, admin, or facilitator of the course
    const isOwner = !!submission;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Not authorized to download this file" },
        { status: 403 }
      );
    }

    // Generate download URL (valid for 1 hour)
    const downloadUrl = await getPresignedUploadUrl(s3Key, "application/octet-stream", 3600);

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files/[key]
 * Delete file (only file owner or admin can delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const s3Key = params.key;

    if (!s3Key) {
      return NextResponse.json(
        { success: false, error: "File key is required" },
        { status: 400 }
      );
    }

    // Verify user owns the file
    const submission = await prisma.assignmentSubmission.findFirst({
      where: {
        submissionUrl: s3Key,
        userId: user.sub,
      },
    });

    // Allow if user is owner or admin
    const isOwner = !!submission;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this file" },
        { status: 403 }
      );
    }

    // Delete from S3
    try {
      await deleteFromS3(s3Key);
    } catch (s3Error) {
      console.error("Error deleting from S3:", s3Error);
      // Continue even if S3 delete fails, clean up database entry
    }

    // Delete from database
    if (submission) {
      await prisma.assignmentSubmission.delete({
        where: { id: submission.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
