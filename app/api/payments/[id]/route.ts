import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

// Update payment
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: paymentId } = await params;
        const body = await request.json();
        const { status, amount, method, transactionId, notes } = body;

        // Validate payment exists
        const existingPayment = await prisma.payment.findUnique({
            where: { id: paymentId }
        });

        if (!existingPayment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        // Update payment
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                ...(status && { status }),
                ...(amount && { amount: Number(amount) }),
                ...(method && { method }),
                ...(transactionId !== undefined && { transactionId }),
                ...(notes !== undefined && { notes }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                booking: {
                    select: {
                        id: true,
                        checkin: true,
                        checkout: true,
                        room: {
                            select: {
                                id: true,
                                roomNumber: true,
                                floor: true,
                                status: true
                            }
                        },
                        hostel: {
                            select: {
                                id: true,
                                hostelName: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(updatedPayment, { status: 200 });
    } catch (error) {
        console.error("Error updating payment:", error);
        return NextResponse.json(
            { error: "Failed to update payment" },
            { status: 500 }
        );
    }
}

// Delete payment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: paymentId } = await params;
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validate payment exists
        const existingPayment = await prisma.payment.findUnique({
            where: { id: paymentId }
        });

        if (!existingPayment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        // Delete payment
        await prisma.payment.delete({
            where: { id: paymentId }
        });

        return NextResponse.json({ message: "Payment deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting payment:", error);
        return NextResponse.json(
            { error: "Failed to delete payment" },
            { status: 500 }
        );
    }
}
