import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { paymentId, type, reason } = body; // type: 'booking', 'salary', or 'expense'

        if (!paymentId || !type || !reason?.trim()) {
            return NextResponse.json(
                { error: "Missing required fields: paymentId, type, and reason" },
                { status: 400 }
            );
        }

        if (type === 'booking') {
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId }
            });

            if (!payment) {
                return NextResponse.json({ error: "Payment not found" }, { status: 404 });
            }

            if (payment.approvalStatus !== 'PENDING') {
                return NextResponse.json({
                    error: "Payment is not pending approval"
                }, { status: 400 });
            }

            const result = await prisma.$transaction(async (tx: any) => {
                const updatedPayment = await tx.payment.update({
                    where: { id: paymentId },
                    data: {
                        approvalStatus: 'REJECTED',
                        rejectedBy: session.user.id,
                        status: 'FAILED',
                        rejectedAt: new Date(),
                        rejectionReason: reason.trim()
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
                                status: true,
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

                // Note: Booking status is not changed on payment rejection
                // Only the payment is rejected, booking remains in its current status

                return updatedPayment;
            });

            // Send payment rejection email notification for booking payments
            try {
                const emailPayload = {
                    type: 'payment_rejected',
                    userEmail: result.user.email,
                    userName: result.user.name,
                    bookingId: result.booking.id,
                    roomNumber: result.booking.room.roomNumber,
                    hostelName: result.booking.hostel.hostelName,
                    amount: result.amount,
                    paymentId: result.id,
                    reason: reason.trim(),
                    paymentType: 'booking'
                };

                await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mail/send-notification`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(emailPayload),
                });
            } catch (emailError) {
                console.error("Error sending payment rejection email:", emailError);
                // Don't fail the payment rejection if email fails
            }

            return NextResponse.json({
                success: true,
                message: "Booking payment rejected successfully",
                payment: result
            });

        } else if (type === 'salary') {
            const salary = await prisma.salary.findUnique({
                where: { id: paymentId }
            });

            if (!salary) {
                return NextResponse.json({ error: "Salary not found" }, { status: 404 });
            }

            if (salary.status !== 'PENDING') {
                return NextResponse.json({
                    error: "Salary is not pending approval"
                }, { status: 400 });
            }

            const updatedSalary = await prisma.salary.update({
                where: { id: paymentId },
                data: {
                    status: 'CANCELLED',
                    processedBy: session.user.id,
                    processedAt: new Date(),
                    notes: `Rejected: ${reason.trim()}`
                },
                include: {
                    staff: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            position: true,
                            department: true,
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

            // Send salary rejection email notification
            try {
                const emailPayload = {
                    type: 'payment_rejected',
                    userEmail: updatedSalary.staff.email,
                    userName: updatedSalary.staff.name,
                    amount: updatedSalary.amount,
                    paymentId: updatedSalary.id,
                    reason: reason.trim(),
                    paymentType: 'salary',
                    staffPosition: updatedSalary.staff.position,
                    hostelName: updatedSalary.staff.hostel.hostelName
                };

                await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/mail/send-notification`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(emailPayload),
                });
            } catch (emailError) {
                console.error("Error sending salary rejection email:", emailError);
                // Don't fail the salary rejection if email fails
            }

            return NextResponse.json({
                success: true,
                message: "Salary payment rejected successfully",
                salary: updatedSalary
            });

        } else if (type === 'expense') {
            // Handle expense rejection
            const expense = await prisma.expense.findUnique({
                where: { id: paymentId },
                include: {
                    user: true,
                    hostel: true
                }
            });

            if (!expense) {
                return NextResponse.json(
                    { error: "Expense not found" },
                    { status: 404 }
                );
            }

            if (expense.status !== 'PENDING') {
                return NextResponse.json(
                    { error: "Expense is not pending approval" },
                    { status: 400 }
                );
            }

            const updatedExpense = await prisma.expense.update({
                where: { id: paymentId },
                data: {
                    status: 'REJECTED',
                    approvedBy: session.user.id,
                    approvedAt: new Date(),
                    notes: reason
                },
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

            return NextResponse.json({
                success: true,
                message: "Expense rejected successfully",
                expense: updatedExpense
            });

        } else {
            return NextResponse.json(
                { error: "Invalid payment type. Must be 'booking', 'salary', or 'expense'" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error rejecting payment:", error);
        return NextResponse.json(
            { error: "Failed to reject payment" },
            { status: 500 }
        );
    }
}
