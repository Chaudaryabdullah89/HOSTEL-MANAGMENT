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
        const { notes } = await request.json().catch(() => ({ notes: undefined }));

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
                status: "APPROVED",
                approvedBy: session.user.id,
                approvedAt: new Date(),
                notes: (notes ?? expense.notes) ?? null,
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
        console.error("Error approving expense:", error);
        return NextResponse.json({ error: "Failed to approve expense" }, { status: 500 });
    }
}


