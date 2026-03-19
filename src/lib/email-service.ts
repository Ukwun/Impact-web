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
    const fromEmail = options.from || process.env.SMTP_FROM_EMAIL || "noreply@impactclub.com";

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

  // Certificate issued
  certificateIssued: (certificate: any) => ({
    subject: `Certificate Earned: ${certificate.course.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1FA774;">Congratulations! 🎉</h2>
        <p>Hi ${certificate.user.firstName},</p>
        <p>You have successfully completed <strong>"${certificate.course.title}"</strong> and earned your certificate!</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Certificate Details:</strong></p>
          <p>Certificate ID: ${certificate.certificateNumber}</p>
          <p>Issued: ${certificate.issuedDate.toLocaleDateString()}</p>
          <p>Course: ${certificate.course.title}</p>
        </div>
        <p>
          <a href="${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/certificates/${certificate.id}"
             style="background: #1FA774; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
            View Certificate
          </a>
        </p>
        <p>Share your achievement with your network and add it to your professional profile!</p>
        <p>Best regards,<br>The ImpactEdu Team</p>
      </div>
    `,
  }),

  // Quiz completed
  quizCompleted: (attempt: any) => ({
    subject: `Quiz Results: ${attempt.quiz.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Quiz Completed!</h2>
        <p>Hi ${attempt.user.firstName},</p>
        <p>You have completed the quiz for <strong>"${attempt.quiz.title}"</strong>.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Results:</strong></p>
          <p>Score: ${attempt.score}%</p>
          <p>Status: ${attempt.passed ? '✅ Passed' : '❌ Not Passed'}</p>
          <p>Time Spent: ${Math.floor(attempt.timeSpent / 60)}:${(attempt.timeSpent % 60).toString().padStart(2, '0')}</p>
          <p>Completed: ${attempt.completedAt.toLocaleDateString()}</p>
        </div>
        ${!attempt.passed ? '<p>You can retake this quiz to improve your score.</p>' : '<p>Great job! Keep up the excellent work.</p>'}
        <p>
          <a href="${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/courses/${attempt.quiz.courseId}"
             style="background: #1FA774; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
            Continue Learning
          </a>
        </p>
      </div>
    `,
  }),

  // Event registration
  eventRegistration: (registration: any) => ({
    subject: `Registration Confirmed: ${registration.event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1FA774;">Registration Confirmed! 🎉</h2>
        <p>Hi ${registration.user.firstName},</p>
        <p>Your registration for <strong>"${registration.event.title}"</strong> has been confirmed.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Event Details:</strong></p>
          <p>Date: ${registration.event.eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          ${registration.event.startTime ? `<p>Start Time: ${registration.event.startTime}</p>` : ''}
          ${registration.event.endTime ? `<p>End Time: ${registration.event.endTime}</p>` : ''}
          <p>Venue: ${registration.event.venue}</p>
          <p>Location: ${registration.event.location}</p>
          <p>Registration Date: ${registration.registeredAt.toLocaleDateString()}</p>
        </div>
        <p>
          <a href="${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/events/${registration.eventId}"
             style="background: #1FA774; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
            View Event Details
          </a>
        </p>
        <p>We look forward to seeing you at the event!</p>
        <p>Best regards,<br>The ImpactEdu Team</p>
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
