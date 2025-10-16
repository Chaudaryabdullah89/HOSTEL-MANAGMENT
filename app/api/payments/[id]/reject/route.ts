import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paymentId } = await params;
        const { reason } = await request.json();

        if (!reason || !reason.trim()) {
            return NextResponse.json({ 
                error: "Rejection reason is required" 
            }, { status: 400 });
        }

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

        // Update payment approval status
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                approvalStatus: 'REJECTED',
                rejectedBy: 'admin', // TODO: Get from session
                rejectedAt: new Date(),
                rejectionReason: reason.trim(),
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
            message: "Payment rejected successfully",
            payment: updatedPayment
        });

    } catch (error) {
        console.error("Error rejecting payment:", error);
        return NextResponse.json(
            { error: "Failed to reject payment" },
            { status: 500 }
        );
    }
}
