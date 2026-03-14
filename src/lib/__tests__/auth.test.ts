import { validateEmail, validatePassword, hashPassword } from "@/lib/auth";

describe("Auth Utilities", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      const validEmails = [
        "user@example.com",
        "test.user@example.co.uk",
        "user+tag@example.com",
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "invalid.email",
        "@example.com",
        "user@",
        "user.example.com",
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe("validatePassword", () => {
    it("should validate strong passwords", () => {
      const strongPasswords = [
        "SecurePassword123",
        "MyP@ssw0rdIsStrong",
        "12345678AbC",
      ];

      strongPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
      });
    });

    it("should reject weak passwords", () => {
      const weakPasswords = [
        "short", // Too short
        "abcdefgh", // No uppercase or numbers
        "12345678", // No letters
        "ABCDEFGH", // No lowercase or numbers
      ];

      weakPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
      });
    });

    it("should provide helpful error messages", () => {
      const result = validatePassword("weak");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("hashPassword", () => {
    it("should hash passwords", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should produce different hashes for same password", async () => {
      const password = "TestPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });
});
