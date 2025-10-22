import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

// Get all payments (booking payments + salary payments) for approval
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';
        const status = searchParams.get('status') || 'all';


        let whereClause: any = {};
        if (status !== 'all') {

            whereClause.approvalStatus = status;
        }
        const salaryWhere: any = {};
        if (status !== 'all') {
            // Map unified approval status -> salary.status
            if (status === 'PENDING') salaryWhere.status = 'PENDING';
            else if (status === 'APPROVED') salaryWhere.status = 'PAID';
            else if (status === 'REJECTED') salaryWhere.status = 'CANCELLED';
        }
        const expenseWhere: any = {};
        if (status !== 'all') {
            // Expense uses status directly with same values
            expenseWhere.status = status;
        }

        // Get booking payments
        const bookingPayments = await prisma.payment.findMany({
            where: {
                ...whereClause,
                bookingId: { not: null }
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
                booking: {
                    select: {
                        id: true,
                        checkin: true,
                        checkout: true,
                        bookingType: true,
                        status: true,
                        price: true,
                        notes: true,
                        createdAt: true,
                        room: {
                            select: {
                                id: true,
                                roomNumber: true,
                                floor: true,
                                status: true,
                                type: true
                            }
                        },
                        hostel: {
                            select: {
                                id: true,
                                hostelName: true
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                role: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get salary payments (all statuses)
        const salaryPayments = await prisma.salary.findMany({
            where: salaryWhere,
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const expenses = await prisma.expense.findMany(
            {
                where: expenseWhere,
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
                    hostel: {
                        select: {
                            id: true,
                            hostelName: true
                        }
                    },
                    approver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

        const formatedExpenses = expenses.map((expense: any) => ({
            id: expense.id,
            type: 'expense',
            amount: expense.amount,
            currency: 'PKR',
            method: 'CASH',
            status: expense.status ?? 'PENDING',
            approvalStatus: expense.status ?? 'PENDING',
            transactionId: null,
            notes: expense.notes,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,


            approvedBy: expense.approvedBy ?? null,
            approvedAt: (expense as any).approvedAt ?? null,
            rejectedBy: (expense as any).rejectedBy ?? null,
            rejectedAt: (expense as any).rejectedAt ?? null,
            rejectionReason: (expense as any).rejectionReason ?? null,
            approver: expense.approver ?? null,
            user: {
                id: expense.user.id,
                name: expense.user.name,
                email: expense.user.email,
                phone: expense.user.phone,
                role: expense.user.role
            },

            booking: null,
            salary: null,
            expense: {
                id: expense.id,
                title: expense.title,
                description: expense.description,
                category: expense.category,
                amount: expense.amount,
                receiptUrl: expense.receiptUrl,
                hostel: {
                    id: expense.hostel.id,
                    hostelName: expense.hostel.hostelName
                }
            }
        }));


        const formattedBookingPayments = bookingPayments.map((payment: any) => ({
            id: payment.id,
            type: 'booking',
            amount: payment.amount,
            currency: 'PKR',
            method: payment.method,
            status: payment.status,
            approvalStatus: payment.approvalStatus,
            transactionId: payment.transactionId,
            notes: payment.notes,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            approvedBy: payment.approvedBy,
            approvedAt: payment.approvedAt,
            rejectedBy: payment.rejectedBy,
            rejectedAt: payment.rejectedAt,
            rejectionReason: payment.rejectionReason,

            user: payment.booking?.user || null,
            booking: payment.booking,
            salary: null
        }));

        const formattedSalaryPayments = salaryPayments.map((salary: any) => ({
            id: salary.id,
            type: 'salary',
            amount: salary.netAmount,
            currency: salary.currency,
            method: 'BANK_TRANSFER', // Default for salary payments
            status: salary.status,
            approvalStatus: salary.status === 'PENDING' ? 'PENDING' :
                salary.status === 'PAID' ? 'APPROVED' :
                    salary.status === 'CANCELLED' ? 'REJECTED' : 'PENDING',
            transactionId: null,
            notes: salary.notes,
            createdAt: salary.createdAt,
            updatedAt: salary.updatedAt,
            approvedBy: salary.processedBy,
            approvedAt: salary.processedAt,
            rejectedBy: salary.status === 'CANCELLED' ? salary.processedBy : null,
            rejectedAt: salary.status === 'CANCELLED' ? salary.processedAt : null,
            rejectionReason: salary.status === 'CANCELLED' ? salary.notes : null,
            user: {
                id: salary.staff.id,
                name: salary.staff.name,
                email: salary.staff.email,
                phone: salary.staff.phone,
                role: 'STAFF'
            },
            booking: null,
            salary: {
                id: salary.id,
                payPeriod: salary.payPeriod,
                payDate: salary.payDate,
                baseAmount: salary.baseAmount,
                overtimeAmount: salary.overtimeAmount,
                bonusAmount: salary.bonusAmount,
                deductions: salary.deductions,
                netAmount: salary.netAmount,
                staff: salary.staff
            }
        }));

        let allPayments = [...formattedBookingPayments, ...formattedSalaryPayments, ...formatedExpenses];

        if (type === 'booking') {
            allPayments = formattedBookingPayments;
        } else if (type === 'salary') {
            allPayments = formattedSalaryPayments;
        } else if (type === 'expense') {
            allPayments = formatedExpenses
        }


        allPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(allPayments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}
