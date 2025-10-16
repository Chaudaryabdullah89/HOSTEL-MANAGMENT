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
            where: {},
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

        const expenses  = await prisma.expense.findMany(
            {
                where : {},
            include : {
                
                user :{
                    select : {
                        id : true,
                        name : true,
                        email : true,
                        phone : true,
                        role : true
                    }
                },
                hostel :{
                    select : {
                        id : true,
                        hostelName : true
                    }
                },
                approver :{
                    select : {
                        id : true,
                        name : true,
                        email : true,
                        phone : true
                    }
                }
            },
            orderBy : {
                createdAt : 'desc'
            }
        });

        // Format data consistently
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
            user: payment.user,
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

        // Combine and filter based on type
        let allPayments = [...formattedBookingPayments, ...formattedSalaryPayments];

        if (type === 'booking') {
            allPayments = formattedBookingPayments;
        } else if (type === 'salary') {
            allPayments = formattedSalaryPayments;
        }

        // Sort by creation date
        allPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(allPayments);
    } catch (error) {
        console.error("Error fetching unified payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments" },
            { status: 500 }
        );
    }
}
