import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

// PUT /api/users/[id]/status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(request);
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: userId } = await params;
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const { status } = await request.json();
        if (status !== "active" && status !== "inactive") {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { isActive: status === "active" },
        });

        return NextResponse.json({ user: updated }, { status: 200 });
    } catch (error) {
        console.error("Error updating user status:", error);
        return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
    }
}


