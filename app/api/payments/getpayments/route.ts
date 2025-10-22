import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWardenAuth } from "@/lib/warden-auth";

export async function GET(request: Request) {
    try {
        // Check if user is warden and get their hostel assignments
        let wardenHostelIds: string[] = [];
        try {
            const wardenAuth = await requireWardenAuth(request);
            wardenHostelIds = wardenAuth.hostelIds;
        } catch (error) {
            // If not a warden, continue without filtering (admin access)
            console.log("No warden auth, showing all payments");
        }

        const whereClause = wardenHostelIds.length > 0
            ? { hostelId: { in: wardenHostelIds } }
            : {};

        const payments = await prisma.payment.findMany({
            where: whereClause,
            select: {
                id: true,
                bookingId: true,
                amount: true,
                method: true,
                status: true,
                transactionId: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                // Approval fields
                approvalStatus: true,
                approvedBy: true,
                approvedAt: true,
                rejectedBy: true,
                rejectedAt: true,
                rejectionReason: true,
                approver: {
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
                        bookingType: true,
                        price: true,
                        status: true,
                        notes: true,
                        createdAt: true,
                        room: {
                            select: {
                                id: true,
                                roomNumber: true,
                                floor: true,
                                status: true,
                                type: true,
                            }
                        },
                        hostel: {
                            select: {
                                id: true,
                                hostelName: true,
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                phone: true,
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        phone: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Debug logging
        console.log('Total payments fetched:', payments.length);
        type PaymentWithType = typeof payments[number] & { type?: string };
        const bookingPayments = payments.filter((p: PaymentWithType) => p.type === 'booking');
        console.log('Booking payments:', bookingPayments.length);
        if (bookingPayments.length > 0) {
            console.log('First booking payment:', JSON.stringify(bookingPayments[0], null, 2));
        }

        return NextResponse.json(payments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}