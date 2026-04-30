import { NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3-client";
import path from "path";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "courses");
const MAX_FILE_SIZES = {
  video: 500 * 1024 * 1024, // 500MB for videos
  pdf: 50 * 1024 * 1024,    // 50MB for PDFs
  document: 20 * 1024 * 1024, // 20MB for Word docs
};

const ALLOWED_TYPES = {
  video: ["video/mp4", "video/webm", "video/quicktime"],
  pdf: ["application/pdf"],
  document: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

// Helper to verify authentication
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

// Helper to check authorization
function isAuthorized(userRole: string) {
  return ["ADMIN", "FACILITATOR"].includes(userRole?.toUpperCase());
}

// Helper to validate file
function validateFile(file: File, fileType: "video" | "pdf" | "document"): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "File is required" };
  }

  const maxSize = MAX_FILE_SIZES[fileType];
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB` };
  }

  const allowedTypes = ALLOWED_TYPES[fileType];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}` };
  }

  return { valid: true };
}

// Helper to generate unique S3 key
function generateFileKey(file: File, fileType: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split(".").pop();
  return `courses/${fileType}-${timestamp}-${random}.${extension}`;
}

/**
 * POST /api/courses/upload
 * Upload course materials (video, PDF, Word documents)
 * 
 * Expected FormData:
 * - courseId: string (optional - for updating existing course)
 * - title: string (course title)
 * - description: string (course description)
 * - difficulty: string (BEGINNER|INTERMEDIATE|ADVANCED)
 * - duration: number (in minutes)
 * - language: string (default: English)
 * - videoFile: File (optional, max 500MB)
 * - pdfFile: File (optional, max 50MB)
 * - wordFile: File (optional, max 20MB)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify authorization
    if (!isAuthorized(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only facilitators and admins can upload courses",
        },
        { status: 403 }
      );
    }



    // Parse FormData
    const formData = await req.formData();
    const courseId = formData.get("courseId") as string | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const difficulty = (formData.get("difficulty") as string) || "BEGINNER";
    const duration = parseInt(formData.get("duration") as string) || 60;
    const language = (formData.get("language") as string) || "English";

    const videoFile = formData.get("videoFile") as File | null;
    const pdfFile = formData.get("pdfFile") as File | null;
    const wordFile = formData.get("wordFile") as File | null;

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Validate files if present
    const uploadedFiles: { type: string; url: string; fileName: string; fileSize: number }[] = [];

    if (videoFile) {
      const validation = validateFile(videoFile, "video");
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
      }

      const fileKey = generateFileKey(videoFile, "video");
      const bytes = await videoFile.arrayBuffer();
      const { url } = await uploadToS3(Buffer.from(bytes), fileKey, videoFile.type);

      uploadedFiles.push({
        type: "video",
        url,
        fileName: videoFile.name,
        fileSize: videoFile.size,
      });

      console.log(`✅ Video uploaded to S3: ${fileKey}`);
    }

    if (pdfFile) {
      const validation = validateFile(pdfFile, "pdf");
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
      }

      const fileKey = generateFileKey(pdfFile, "pdf");
      const bytes = await pdfFile.arrayBuffer();
      const { url } = await uploadToS3(Buffer.from(bytes), fileKey, pdfFile.type);

      uploadedFiles.push({
        type: "pdf",
        url,
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
      });

      console.log(`✅ PDF uploaded to S3: ${fileKey}`);
    }

    if (wordFile) {
      const validation = validateFile(wordFile, "document");
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
      }

      const fileKey = generateFileKey(wordFile, "document");
      const bytes = await wordFile.arrayBuffer();
      const { url } = await uploadToS3(Buffer.from(bytes), fileKey, wordFile.type);

      uploadedFiles.push({
        type: "document",
        url,
        fileName: wordFile.name,
        fileSize: wordFile.size,
      });

      console.log(`✅ Document uploaded to S3: ${fileKey}`);
    }

    // Create or update course
    let course;
    if (courseId) {
      // Update existing course
      course = await prisma.course.update({
        where: { id: courseId },
        data: {
          title,
          description,
          difficulty,
          duration,
          language,
        },
      });
    } else {
      // Create new course
      course = await prisma.course.create({
        data: {
          title,
          description,
          difficulty,
          duration,
          language,
          instructor: user.name || user.email,
          createdById: user.sub,
          isPublished: false,
        },
      });
    }

    // Create a lesson and attach materials to it
    if (uploadedFiles.length > 0) {
      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: `${title} - Main Content`,
          description: "Primary course materials",
          order: 1,
          videoUrl: uploadedFiles.find((f) => f.type === "video")?.url,
          // Create associated materials
          materials: {
            create: uploadedFiles.map((file) => ({
              title: file.fileName,
              type: file.type,
              url: file.url,
              fileSize: file.fileSize,
            })),
          },
        },
      });

      console.log(`✅ Lesson created with ${uploadedFiles.length} materials for course ${course.id}`);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            duration: course.duration,
            isPublished: course.isPublished,
            createdAt: course.createdAt,
          },
          uploadedFiles,
          message: `Course created with ${uploadedFiles.length} material(s)`,
        },
      },
      { status: courseId ? 200 : 201 }
    );
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to upload course materials" 
      },
      { status: 500 }
    );
  }
}
