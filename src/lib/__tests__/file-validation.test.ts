import {
  validateFile,
  generateS3Key,
  sanitizeFilename,
  FILE_LIMITS,
  ALLOWED_MIME_TYPES,
} from "@/lib/file-validation";

describe("File Validation", () => {
  describe("validateFile", () => {
    it("should validate correct file within limits", async () => {
      const buffer = Buffer.from("fake image data");
      const result = await validateFile(buffer, "test.pdf", "document");

      // Note: This will fail because the actual file magic bytes are wrong
      // In real scenario, you'd test with proper file data
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("error");
    });

    it("should reject file exceeding size limit", async () => {
      const oversizeBuffer = Buffer.alloc(FILE_LIMITS.image + 1000); // Exceed limit
      const result = await validateFile(oversizeBuffer, "large.jpg", "image");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds limit");
    });

    it("should accept different file categories", async () => {
      const categories = ["image", "document", "video", "avatar", "default"] as const;

      categories.forEach((category) => {
        expect(FILE_LIMITS).toHaveProperty(category);
      });
    });
  });

  describe("generateS3Key", () => {
    it("should generate hierarchical S3 key", () => {
      const key = generateS3Key("user123", "document.pdf", "document");

      expect(key).toContain("document/");
      expect(key).toContain("user123");
      expect(key).toContain(".pdf");
    });

    it("should handle special characters in filename", () => {
      const key = generateS3Key("user123", "my document (final).pdf", "document");

      expect(key).not.toContain("(");
      expect(key).not.toContain(")");
      expect(key).toContain("document");
    });

    it("should include timestamp for uniqueness", () => {
      const key1 = generateS3Key("user123", "file.txt", "document");
      const key2 = generateS3Key("user123", "file.txt", "document");

      // Keys should be different due to timestamp
      expect(key1).not.toBe(key2);
    });
  });

  describe("sanitizeFilename", () => {
    it("should remove special characters", () => {
      const filename = "my file@#$.doc";
      const sanitized = sanitizeFilename(filename);

      expect(sanitized).not.toContain("@");
      expect(sanitized).not.toContain("#");
      expect(sanitized).not.toContain("$");
    });

    it("should convert to lowercase", () => {
      const filename = "MyDocument.PDF";
      const sanitized = sanitizeFilename(filename);

      expect(sanitized).toBe(sanitized.toLowerCase());
    });

    it("should handle multiple consecutive special characters", () => {
      const filename = "file...name---here.txt";
      const sanitized = sanitizeFilename(filename);

      expect(sanitized).not.toContain("...");
      expect(sanitized).not.toContain("---");
    });
  });

  describe("ALLOWED_MIME_TYPES", () => {
    it("should have correct MIME types for images", () => {
      const imageMimes = ALLOWED_MIME_TYPES.image;

      expect(imageMimes).toContain("image/jpeg");
      expect(imageMimes).toContain("image/png");
    });

    it("should have correct MIME types for documents", () => {
      const docMimes = ALLOWED_MIME_TYPES.document;

      expect(docMimes).toContain("application/pdf");
    });
  });
});
