import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendmail";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        console.log("🔍 Forgot password request received");
        const { email } = await request.json();
        console.log("📧 Email received:", email);

        if (!email) {
            console.log("❌ No email provided");
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Check if user exists
        console.log("🔍 Checking if user exists...");
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true }
        });
        console.log("👤 User found:", user ? "Yes" : "No");

        if (!user) {

            return NextResponse.json(
                { message: "If an account with this email exists, you will receive a password reset link." },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Delete any existing password reset tokens for this user
        await prisma.passwordReset.deleteMany({
            where: { userId: user.id }
        });

        // Create new password reset record
        const passwordReset = await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt: expiresAt
            }
        });

        // Generate reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/reset-password?token=${resetToken}`;

        // Create email HTML
        const html = `
      <div style="font-family: Arial, sans-serif; background: #f2f3f8; padding: 32px;">
        <div style="max-width: 520px; background: #fff; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(18,38,63,0.03);">
          <div style="background: #3b82f6; color: #fff; padding: 16px 32px;">
            <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">Password Reset Request</h2>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #292929;">Hello ${user.name || 'User'},</p>
            <p style="font-size: 16px; color: #292929;">We received a request to reset your password for your Sama Hostel account.</p>
            <p style="font-size: 16px; color: #292929;">Click the button below to reset your password:</p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #3b82f6; word-break: break-all; background: #f8f9fa; padding: 12px; border-radius: 4px; margin: 16px 0;">
              ${resetUrl}
            </p>
            <p style="font-size: 14px; color: #666;">This link will expire in 1 hour for security reasons.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;">
            <p style="font-size: 13px; color: #a0aec0;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p style="font-size: 13px; color: #a0aec0;">Best regards,<br>Sama Hostel Team</p>
          </div>
        </div>
      </div>
    `;

        // Send email
        try {
            await sendEmail({
                to: user.email,
                subject: "Reset Your Password - Sama Hostel",
                html: html
            });

            console.log("✅ Password reset email sent successfully to:", user.email);
        } catch (emailError) {
            console.error("❌ Failed to send password reset email:", emailError);

            // Delete the password reset record if email fails
            await prisma.passwordReset.delete({
                where: { id: passwordReset.id }
            });

            return NextResponse.json(
                { error: "Failed to send reset email. Please try again later." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "If an account with this email exists, you will receive a password reset link." },
            { status: 200 }
        );

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
