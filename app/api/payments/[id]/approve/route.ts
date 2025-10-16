import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paymentId } = await params;

        // Find the payment
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                user: true,
                booking: true
            }
        });

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        if (payment.approvalStatus !== 'PENDING') {
            return NextResponse.json({ 
                error: "Payment is not pending approval" 
            }, { status: 400 });
        }

        // Update payment approval status and payment status
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                approvalStatus: 'APPROVED',
                status: 'COMPLETED', // Auto-confirm payment when approved
                approvedBy: 'admin', // TODO: Get from session
                approvedAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                booking: {
                    select: {
                        id: true,
                        checkin: true,
                        checkout: true,
                        bookingType: true,
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

        return NextResponse.json({
            success: true,
            message: "Payment approved successfully",
            payment: updatedPayment
        });

    } catch (error) {
        console.error("Error approving payment:", error);
        return NextResponse.json(
            { error: "Failed to approve payment" },
            { status: 500 }
        );
    }
}
