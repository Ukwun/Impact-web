import { Resend } from "resend";
import nodemailer from "nodemailer";

export type EmailProvider = "resend" | "smtp" | "sendgrid";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private provider: EmailProvider;
  private resendClient?: Resend;
  private smtpTransporter?: nodemailer.Transporter;

  constructor() {
    this.provider = (process.env.EMAIL_PROVIDER || "resend") as EmailProvider;

    if (this.provider === "resend" && process.env.RESEND_API_KEY) {
      this.resendClient = new Resend(process.env.RESEND_API_KEY);
    } else if (this.provider === "smtp") {
      this.smtpTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // Use TLS
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async send(options: EmailOptions): Promise<EmailResponse> {
    // Set default from email
    const fromEmail = options.from || process.env.SMTP_FROM_EMAIL || "noreply@impactedu.com";

    if (this.provider === "resend" && this.resendClient) {
      return this.sendViaResend(options, fromEmail);
    } else if (this.provider === "smtp" && this.smtpTransporter) {
      return this.sendViaSMTP(options, fromEmail);
    } else {
      console.warn("Email provider not configured, email not sent");
      return {
        success: false,
        error: "Email provider not configured",
      };
    }
  }

  private async sendViaResend(
    options: EmailOptions,
    fromEmail: string
  ): Promise<EmailResponse> {
    try {
      if (!this.resendClient) {
        return { success: false, error: "Resend client not initialized" };
      }

      const sendOptions: any = {
        from: fromEmail,
        to: Array.isArray(options.to) ? options.to[0] : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      };

      const result = await this.resendClient.emails.send(sendOptions);

      if (result.error) {
        throw result.error;
      }

      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error) {
      console.error("Error sending email via Resend:", error);
      return {
        success: false,
        error: `Failed to send email: ${error}`,
      };
    }
  }

  private async sendViaSMTP(
    options: EmailOptions,
    fromEmail: string
  ): Promise<EmailResponse> {
    try {
      if (!this.smtpTransporter) {
        return { success: false, error: "SMTP transporter not initialized" };
      }

      const info = await this.smtpTransporter.sendMail({
        from: fromEmail,
        to: Array.isArray(options.to) ? options.to.join(",") : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending email via SMTP:", error);
      return {
        success: false,
        error: `Failed to send email: ${error}`,
      };
    }
  }
}

// Email templates
export const emailTemplates = {
  // Account verification email
  verifyEmail: (name: string, verificationLink: string) => ({
    subject: "Verify your ImpactEdu account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ImpactEdu, ${name}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <p>
          <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy this link: ${verificationLink}</p>
        <p style="color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
      </div>
    `,
  }),

  // Password reset email
  resetPassword: (name: string, resetLink: string) => ({
    subject: "Reset your ImpactEdu password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below to create a new password.</p>
        <p>
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link: ${resetLink}</p>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  }),

  // Course enrollment confirmation
  enrollmentConfirmation: (
    studentName: string,
    courseName: string,
    courseLink: string
  ) => ({
    subject: `Welcome to ${courseName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Enrollment Confirmed!</h2>
        <p>Hi ${studentName},</p>
        <p>You have been successfully enrolled in <strong>${courseName}</strong>.</p>
        <p>
          <a href="${courseLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Start Learning
          </a>
        </p>
        <p>We're excited to have you on board!</p>
      </div>
    `,
  }),

  // Assignment submission notification
  assignmentSubmitted: (
    studentName: string,
    assignmentTitle: string,
    assignmentLink: string
  ) => ({
    subject: `Assignment submitted: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Assignment Submitted</h2>
        <p>Hi ${studentName},</p>
        <p>Your assignment <strong>${assignmentTitle}</strong> has been successfully submitted.</p>
        <p>View your submission: 
          <a href="${assignmentLink}">View Assignment</a>
        </p>
        <p>Your instructor will review it shortly.</p>
      </div>
    `,
  }),

  // Grade notification
  gradeNotification: (
    studentName: string,
    assignmentTitle: string,
    grade: string,
    feedback: string,
    courseLink: string
  ) => ({
    subject: `Grade posted for ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Grade is Ready!</h2>
        <p>Hi ${studentName},</p>
        <p>Your instructor has posted a grade for <strong>${assignmentTitle}</strong>.</p>
        <p><strong>Grade: ${grade}</strong></p>
        <p><strong>Feedback:</strong></p>
        <p style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #4CAF50;">
          ${feedback}
        </p>
        <p>
          <a href="${courseLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View More Details
          </a>
        </p>
      </div>
    `,
  }),

  // Certificate earned
  certificateEarned: (
    studentName: string,
    courseName: string,
    certificateLink: string
  ) => ({
    subject: `Certificate Earned: ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations! 🎉</h2>
        <p>Hi ${studentName},</p>
        <p>You have successfully completed <strong>${courseName}</strong> and earned a certificate!</p>
        <p>
          <a href="${certificateLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Download Certificate
          </a>
        </p>
        <p>Share your achievement with your network!</p>
      </div>
    `,
  }),

  // Event reminder
  eventReminder: (
    userName: string,
    eventName: string,
    eventDate: string,
    eventLink: string
  ) => ({
    subject: `Reminder: ${eventName} is coming up`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Event Reminder</h2>
        <p>Hi ${userName},</p>
        <p>This is a reminder that <strong>${eventName}</strong> is scheduled for <strong>${eventDate}</strong>.</p>
        <p>
          <a href="${eventLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Event Details
          </a>
        </p>
        <p>See you there!</p>
      </div>
    `,
  }),
};

// Singleton instance
let emailService: EmailService;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}

export default EmailService;
