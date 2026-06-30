import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || 'test_user',
    pass: process.env.SMTP_PASS || 'test_pass',
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n==================================================');
    console.log(`[DEV EMAIL] Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    
    // Attempt to extract 6-digit OTP
    const otpMatch = html.match(/\b(\d{6})\b/);
    if (otpMatch) {
      console.log(`>>> OTP CODE: ${otpMatch[1]} <<<`);
    }

    // Attempt to extract reset password link
    const linkMatch = html.match(/href="([^"]+)"/);
    if (linkMatch) {
      console.log(`>>> RESET LINK: ${linkMatch[1]} <<<`);
    }
    console.log('==================================================\n');
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'no-reply@aicareerroadmap.com',
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending email: ${(error as Error).message}`);
    // In development mode, we do not throw to allow offline testing
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};
