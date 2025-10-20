import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { reason } = await request.json();

        if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
            return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
        }

        const expense = await prisma.expense.findUnique({ where: { id } });
        if (!expense) {
            return NextResponse.json({ error: "Expense not found" }, { status: 404 });
        }

        if (expense.status !== "PENDING") {
            return NextResponse.json({ error: "Expense is not pending approval" }, { status: 400 });
        }

        const updated = await prisma.expense.update({
            where: { id },
            data: {
                status: "REJECTED",
                approvedBy: session.user.id,
                approvedAt: new Date(),
                notes: reason,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true, role: true }
                },
                approver: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                hostel: {
                    select: { id: true, hostelName: true }
                }
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error rejecting expense:", error);
        return NextResponse.json({ error: "Failed to reject expense" }, { status: 500 });
    }
}


