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
            // Handle booking payment rejection
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

            // Update payment approval status and booking status in a transaction
            const result = await prisma.$transaction(async (tx: any) => {
                // Update payment approval status
                const updatedPayment = await tx.payment.update({
                    where: { id: paymentId },
                    data: {
                        approvalStatus: 'REJECTED',
                        rejectedBy: session.user.id,
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

                // Update booking status to CANCELLED if payment is rejected
                if (updatedPayment.booking) {
                    await tx.booking.update({
                        where: { id: updatedPayment.booking.id },
                        data: {
                            status: 'CANCELLED'
                        }
                    });
                    
                    // Update the booking status in the returned data
                    updatedPayment.booking.status = 'CANCELLED';
                }

                return updatedPayment;
            });

            return NextResponse.json({
                success: true,
                message: "Booking payment rejected successfully and booking cancelled",
                payment: result
            });

        } else if (type === 'salary') {
            // Handle salary payment rejection
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

            // Update salary status to CANCELLED
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
