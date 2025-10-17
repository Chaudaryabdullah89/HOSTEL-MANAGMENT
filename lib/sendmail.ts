import { transporter } from "./nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Check if transporter is properly configured
    if (!transporter) {
      throw new Error("Email transporter is not configured. Please check your environment variables.");
    }

    // Validate required environment variables
    if (!process.env.EMAIL_USER) {
      throw new Error("EMAIL_USER environment variable is not set");
    }

    const info = await transporter.sendMail({
      from: `"Sama Hostel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📨 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}