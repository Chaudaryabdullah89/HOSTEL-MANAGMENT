import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const { token, password, confirmPassword } = await request.json();

        if (!token || !password || !confirmPassword) {
            return NextResponse.json(
                { error: "Token, password, and confirm password are required" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Find the password reset record
        const passwordReset = await prisma.passwordReset.findUnique({
            where: { token },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!passwordReset) {
            return NextResponse.json(
                { error: "Invalid reset token" },
                { status: 400 }
            );
        }

        // Check if token has expired
        if (passwordReset.expiresAt < new Date()) {
            // Delete expired token
            await prisma.passwordReset.delete({
                where: { id: passwordReset.id }
            });

            return NextResponse.json(
                { error: "Reset token has expired" },
                { status: 400 }
            );
        }

        // Check if token has already been used
        if (passwordReset.used) {
            return NextResponse.json(
                { error: "Reset token has already been used" },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password and mark token as used in a transaction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
            // Update user password
            await tx.user.update({
                where: { id: passwordReset.userId },
                data: { password: hashedPassword }
            });

            // Mark token as used
            await tx.passwordReset.update({
                where: { id: passwordReset.id },
                data: { used: true }
            });
        });

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
