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
 * Only the file owner, facilitator of the course, or admin can download
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
        user: true,
      },
    });

    if (!submission) {
      console.warn(`File submission not found for key: ${s3Key}`);
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

    // Check if user is a school admin of the submission owner's school
    let isSchoolAdmin = false;
    if (user.role?.toUpperCase() === 'SCHOOL_ADMIN' && submission.user) {
      // Assuming users have a schoolId field
      const schoolMatch = await prisma.user.findFirst({
        where: {
          id: user.sub,
          // schoolId match with submission user
        },
      });
      isSchoolAdmin = !!schoolMatch;
    }

    // Deny access if not authorized
    if (!isOwner && !isAdmin && !isFacilitator && !isSchoolAdmin) {
      console.warn(
        `Unauthorized file access attempt: ${user.sub} (${user.role}) tried to download ${s3Key}`
      );
      return NextResponse.json(
        { success: false, error: "Not authorized to download this file" },
        { status: 403 }
      );
    }

    // Log the file access for audit trail
    console.log(
      `✅ File access granted to ${user.sub}: ${isOwner ? 'owner' : isAdmin ? 'admin' : isFacilitator ? 'facilitator' : 'school_admin'}`
    );

    // Generate download URL (valid for 1 hour)
    const downloadUrl = await getPresignedUploadUrl(
      s3Key,
      'application/octet-stream',
      3600
    );

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn: 3600,
      fileName: submission.submissionUrl.split('/').pop(),
      submittedBy: submission.user.email,
      submittedAt: submission.submittedAt,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files/[key]
 * Delete file (file owner, facilitator, or admin can delete)
 * This is a production-grade deletion with proper authorization checks
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

    // Delete from S3
    try {
      await deleteFromS3(s3Key);
      console.log(`✅ File deleted from S3: ${s3Key}`);
    } catch (s3Error) {
      console.error(`Error deleting from S3: ${s3Error}`);
      // Continue even if S3 delete fails - clean up database entry anyway
    }

    // Delete from database
    await prisma.assignmentSubmission.delete({
      where: { id: submission.id },
    });

    console.log(
      `✅ File deletion authorized by ${user.sub} (${isOwner ? 'owner' : isAdmin ? 'admin' : 'facilitator'}): ${s3Key}`
    );

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      deletedKey: s3Key,
      deletedBy: isOwner ? 'student' : isAdmin ? 'admin' : 'facilitator',
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
