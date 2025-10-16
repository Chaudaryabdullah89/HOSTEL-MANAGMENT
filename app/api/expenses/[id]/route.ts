import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const expense = await prisma.expense.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true
                    }
                },
                approver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                }
            }
        });

        if (!expense) {
            return NextResponse.json({ error: "Expense not found" }, { status: 404 });
        }

        return NextResponse.json(expense);
    } catch (error) {
        console.error("Error fetching expense:", error);
        return NextResponse.json(
            { error: "Failed to fetch expense" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            amount,
            category,
            status,
            receiptUrl,
            notes
        } = body;

        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (amount !== undefined) updateData.amount = amount;
        if (category !== undefined) updateData.category = category;
        if (status !== undefined) {
            updateData.status = status;
            if (status === "APPROVED" || status === "REJECTED") {
                updateData.approvedBy = session.user.id;
                updateData.approvedAt = new Date();
            }
        }
        if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;
        if (notes !== undefined) updateData.notes = notes;

        const expense = await prisma.expense.update({
            where: { id: params.id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true
                    }
                },
                approver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                }
            }
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error("Error updating expense:", error);
        return NextResponse.json(
            { error: "Failed to update expense" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user has permission to delete (admin or the one who submitted)
        const expense = await prisma.expense.findUnique({
            where: { id: params.id },
            select: { submittedBy: true, status: true }
        });

        if (!expense) {
            return NextResponse.json({ error: "Expense not found" }, { status: 404 });
        }

        // Only allow deletion if user is admin or the one who submitted, and expense is not approved
        if (session.user.role !== "ADMIN" && expense.submittedBy !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized to delete this expense" }, { status: 403 });
        }

        if (expense.status === "APPROVED" || expense.status === "PAID") {
            return NextResponse.json({ error: "Cannot delete approved or paid expenses" }, { status: 400 });
        }

        await prisma.expense.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.error("Error deleting expense:", error);
        return NextResponse.json(
            { error: "Failed to delete expense" },
            { status: 500 }
        );
    }
}
