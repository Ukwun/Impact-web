import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
  uploadToS3,
  getPresignedUploadUrl,
} from "@/lib/s3-client";
import {
  validateFile,
  generateS3Key,
  FileCategory,
} from "@/lib/file-validation";
import prisma from "@/lib/db";

/**
 * POST /api/files/presign
 * Generate presigned URL for file upload
 * Allows client-side upload directly to S3
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = payload.sub as string;
    const body = await request.json();

    const { filename, contentType, category = "default" } = body;

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
    const s3Key = generateS3Key(userId, filename, category);

    // Generate presigned upload URL (valid for 5 minutes)
    const presignedUrl = await getPresignedUploadUrl(
      s3Key,
      contentType,
      300
    );

    return NextResponse.json({
      presignedUrl,
      s3Key,
      bucket: process.env.AWS_S3_BUCKET,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/files/download/[key]
 * Get presigned download URL for a file
 * Used for downloading files from S3 securely
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Authenticate user
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const s3Key = params.key;

    if (!s3Key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    // TODO: Add authorization check - verify user owns the file
    // For now, any authenticated user can download

    // Generate download URL (valid for 1 hour)
    const downloadUrl = await getPresignedUploadUrl(s3Key, "application/octet-stream", 3600);

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
