import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { deleteFromS3 } from "@/lib/s3-client";
import { prisma } from "@/lib/prisma";

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * DELETE /api/files/[key]
 * Delete a file from S3 and database (with authorization)
 * Only the file owner, facilitator, or admin can delete
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

    // Find the submission by S3 key
    const submission = await prisma.assignmentSubmission.findFirst({
      where: {
        submissionUrl: s3Key,
      },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      console.warn(`File submission not found for deletion: ${s3Key}`);
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // AUTHORIZATION CHECKS
    const isOwner = submission.userId === user.sub;
    const isAdmin = user.role?.toUpperCase() === 'ADMIN';
    
    // Check if user is the facilitator of the course
    let isFacilitator = false;
    if (submission.assignment.course) {
      const facilitator = await prisma.course.findFirst({
        where: {
          id: submission.assignment.course.id,
          facilitators: {
            some: {
              id: user.sub,
            },
          },
        },
      });
      isFacilitator = !!facilitator;
    }

    // Deny access if not authorized
    if (!isOwner && !isAdmin && !isFacilitator) {
      console.warn(
        `Unauthorized file deletion attempt: ${user.sub} (${user.role}) tried to delete ${s3Key}`
      );
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this file" },
        { status: 403 }
      );
    }

    try {
      // Delete from S3
      await deleteFromS3(s3Key);
      console.log(`✅ File deleted from S3: ${s3Key}`);
    } catch (s3Error) {
      console.error(`Error deleting from S3: ${s3Error}`);
      // Continue even if S3 deletion fails - we'll clean up the database record
    }

    // Delete from database
    await prisma.assignmentSubmission.delete({
      where: {
        id: submission.id,
      },
    });

    console.log(
      `✅ File deletion authorized and completed by ${user.sub}: ${isOwner ? 'owner' : isAdmin ? 'admin' : 'facilitator'}`
    );

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      deletedKey: s3Key,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete file",
      },
      { status: 500 }
    );
  }
}
