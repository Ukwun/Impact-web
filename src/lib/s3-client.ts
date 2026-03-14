import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client with credentials from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Upload file to S3 bucket
 * @param fileBuffer - File buffer to upload
 * @param key - S3 object key (path)
 * @param contentType - MIME type of file
 * @returns Object containing S3 url and object key
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "",
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Enable public read access (optional, depend on use case)
      ACL: "public-read",
    });

    await s3Client.send(command);

    const bucketName = process.env.AWS_S3_BUCKET || "";
    const region = process.env.AWS_REGION || "us-east-1";
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error(`Failed to upload file to S3: ${error}`);
  }
}

/**
 * Generate presigned URL for S3 object (secure, temporary access)
 * @param key - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL for downloading the file
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "",
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error(`Failed to generate presigned URL: ${error}`);
  }
}

/**
 * Generate presigned URL for file upload (PutObject)
 * @param key - S3 object key
 * @param contentType - MIME type
 * @param expiresIn - URL expiration time in seconds
 * @returns Presigned URL for uploading the file
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 300
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "",
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating presigned upload URL:", error);
    throw new Error(`Failed to generate presigned upload URL: ${error}`);
  }
}

/**
 * Delete file from S3
 * @param key - S3 object key to delete
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "",
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error(`Failed to delete file from S3: ${error}`);
  }
}

export default s3Client;
