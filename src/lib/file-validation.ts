import { fileTypeFromBuffer } from "file-type";

// File size limits (in bytes)
export const FILE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB for images
  document: 20 * 1024 * 1024, // 20MB for documents
  video: 500 * 1024 * 1024, // 500MB for videos
  avatar: 2 * 1024 * 1024, // 2MB for profile avatars
  default: 10 * 1024 * 1024, // 10MB default
};

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  video: ["video/mp4", "video/webm", "video/mpeg"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
  default: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "video/mp4",
    "video/webm",
    "video/mpeg",
  ],
};

export type FileCategory = "image" | "document" | "video" | "avatar" | "default";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: string;
}

/**
 * Validate file before upload
 * @param fileBuffer - File buffer
 * @param filename - Original filename
 * @param category - File category for size/type limits
 * @returns Validation result
 */
export async function validateFile(
  fileBuffer: Buffer,
  filename: string,
  category: FileCategory = "default"
): Promise<FileValidationResult> {
  // Check file size
  const sizeLimit = FILE_LIMITS[category];
  if (fileBuffer.length > sizeLimit) {
    return {
      valid: false,
      error: `File size exceeds limit of ${sizeLimit / 1024 / 1024}MB`,
    };
  }

  // Validate file type using magic bytes
  const fileType = await fileTypeFromBuffer(fileBuffer);
  if (!fileType) {
    return {
      valid: false,
      error: "Could not determine file type",
    };
  }

  const allowedTypes = ALLOWED_MIME_TYPES[category];
  if (!allowedTypes.includes(fileType.mime)) {
    return {
      valid: false,
      error: `File type ${fileType.mime} not allowed for ${category} uploads`,
    };
  }

  // Validate filename
  if (!filename || filename.length === 0) {
    return {
      valid: false,
      error: "Filename cannot be empty",
    };
  }

  // Check for suspicious filename patterns
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return {
      valid: false,
      error: "Invalid filename pattern",
    };
  }

  return {
    valid: true,
    fileType: fileType.mime,
  };
}

/**
 * Generate safe S3 key from filename
 * @param userId - User ID
 * @param filename - Original filename
 * @param category - File category
 * @returns Safe S3 key
 */
export function generateS3Key(
  userId: string,
  filename: string,
  category: FileCategory = "default"
): string {
  // Remove special characters and convert to lowercase
  const sanitized = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");

  // Extract file extension
  const ext = sanitized.split(".").pop() || "";
  const baseName = sanitized.slice(0, -ext.length - 1);

  // Generate unique key with timestamp
  const timestamp = Date.now();
  const uniqueName = `${baseName}-${timestamp}.${ext}`;

  // Create hierarchical path for better organization
  return `${category}/${userId}/${uniqueName}`;
}

/**
 * Sanitize filename for download
 * @param filename - Original filename
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9.-]/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}
