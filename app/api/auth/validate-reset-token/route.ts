import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
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

        return NextResponse.json(
            {
                message: "Token is valid",
                user: passwordReset.user
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
