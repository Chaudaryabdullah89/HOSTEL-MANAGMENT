import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();
        const session = await getServerSession(request);
        
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Find the email change request
        const emailChangeRequest = await prisma.emailChangeRequest.findUnique({
            where: { userId: userId }
        });

        if (!emailChangeRequest) {
            return NextResponse.json({ error: "No email change request found" }, { status: 400 });
        }

        // Check if the code matches
        if (emailChangeRequest.code !== code) {
            return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
        }

        // Check if the code has expired
        if (emailChangeRequest.expiresAt < new Date()) {
            return NextResponse.json({ error: "Verification code has expired" }, { status: 400 });
        }

        // Check if the email matches
        if (emailChangeRequest.newEmail !== email) {
            return NextResponse.json({ error: "Email does not match the request" }, { status: 400 });
        }

        // Update the user's email
        await prisma.user.update({
            where: { id: userId },
            data: { email: email }
        });

        // Delete the email change request
        await prisma.emailChangeRequest.delete({
            where: { userId: userId }
        });

        return NextResponse.json({ 
            message: "Email verified and updated successfully" 
        }, { status: 200 });

    } catch (error) {
        console.error("Error verifying email:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}