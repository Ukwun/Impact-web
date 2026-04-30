import { getEmailService } from '@/lib/email-service';

export async function sendStripePaymentConfirmation({ user, course, amount, currency, paymentId }) {
  const emailService = getEmailService();
  // Student email
  await emailService.send({
    to: user.email,
    subject: `Payment Confirmed - ${course.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #635bff;">Payment Successful! 🎉</h2>
        <p>Dear ${user.firstName},</p>
        <p>Your payment has been processed successfully. Here are the details:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Course:</strong> ${course.title}</p>
          <p><strong>Amount:</strong> ${currency} ${amount}</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>You now have full access to your course materials. Start learning today!</p>
        <a href="/dashboard/courses/${course.id}"
           style="background: #635bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Start Learning
        </a>
        <p>Best regards,<br>The ImpactEdu Team</p>
      </div>
    `,
  });

  // Admin/owner notification
  const adminEmail = process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await emailService.send({
      to: adminEmail,
      subject: `New Payment Received - ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #635bff;">New Payment Received</h2>
          <p><strong>Student:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
          <p><strong>Course:</strong> ${course.title}</p>
          <p><strong>Amount:</strong> ${currency} ${amount}</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      `,
    });
  }
}
