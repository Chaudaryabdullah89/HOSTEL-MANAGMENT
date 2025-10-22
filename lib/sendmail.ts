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

    console.log("📧 Attempting to send email to:", to);
    console.log("📧 Email subject:", subject);
    console.log("📧 From:", process.env.EMAIL_USER);

    const info = await transporter.sendMail({
      from: `"Sama Hostel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📨 Email sent successfully:", info.messageId);
    console.log("📨 Response:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:");
    if (error && typeof error === 'object') {
      console.error("❌ Error type:", (error as Error).constructor.name);
      console.error("❌ Error message:", (error as Error).message);
      console.error("❌ Error code:", (error as any).code);
    }
    console.error("❌ Full error:", error);
    throw error;
  }
}