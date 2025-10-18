import nodemailer from "nodemailer";

// Validate required environment variables
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  console.error("Please set the following environment variables:");
  console.error("- EMAIL_HOST (e.g., smtp.gmail.com)");
  console.error("- EMAIL_PORT (e.g., 587)");
  console.error("- EMAIL_USER (your email address)");
  console.error("- EMAIL_PASS (your email password or app password)");
  console.error("- EMAIL_SECURE (true for port 465, false for other ports)");
}

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Only verify if all required environment variables are present
if (missingEnvVars.length === 0) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("❌ Email server connection failed:", error);
    } else {
      console.log("✅ Email server is ready to take messages");
    }
  });
} else {
  console.warn("⚠️ Email transporter not verified due to missing environment variables");
}