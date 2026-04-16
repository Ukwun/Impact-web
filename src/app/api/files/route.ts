import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
  uploadToS3,
  getPresignedUploadUrl,
  deleteFromS3,
} from "@/lib/s3-client";
import {
  validateFile,
  generateS3Key,
  FileCategory,
} from "@/lib/file-validation";
import { prisma } from "@/lib/prisma";

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * POST /api/files/presign
 * Generate presigned URL for file upload
 * Allows client-side upload directly to S3
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filename, contentType, category = "default", assignmentId } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    // Validate file category
    const validCategories: FileCategory[] = ["image", "document", "video", "avatar", "default"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid file category" },
        { status: 400 }
      );
    }

    // Generate S3 key
    const s3Key = generateS3Key(user.sub, filename, category);

    // Generate presigned upload URL (valid for 5 minutes)
    const presignedUrl = await getPresignedUploadUrl(
      s3Key,
      contentType,
      300
    );

    // Store file metadata in database
    if (assignmentId) {
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          userId: user.sub,
          submissionUrl: s3Key,
          submittedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      presignedUrl,
      s3Key,
      bucket: process.env.AWS_S3_BUCKET,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/files
 * List user's uploaded files (with pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all assignment submissions for user
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { userId: user.sub },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: submissions.map((sub) => ({
        id: sub.id,
        filename: sub.submissionUrl.split("/").pop(),
        s3Key: sub.submissionUrl,
        assignmentTitle: sub.assignment?.title || "Unknown",
        uploadedAt: sub.submittedAt,
      })),
    });
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list files" },
      { status: 500 }
    );
  }
}
