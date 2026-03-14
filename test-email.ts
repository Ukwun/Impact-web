import { getEmailService, emailTemplates } from './src/lib/email-service';

async function testEmail() {
  console.log('Testing email service...');

  const emailService = getEmailService();

  // Test password reset email
  const resetTemplate = emailTemplates.resetPassword('Test User', 'https://impactedu.com/reset-password?token=test123');

  const result = await emailService.send({
    to: 'test@example.com', // Replace with your actual test email
    subject: resetTemplate.subject,
    html: resetTemplate.html,
  });

  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } else {
    console.log('❌ Email failed to send');
    console.log('Error:', result.error);
  }
}

testEmail().catch(console.error);