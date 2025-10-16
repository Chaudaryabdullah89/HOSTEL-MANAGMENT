import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const payments = await prisma.payment.findMany({
            select: {
                id: true,
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
                                status: true,
                            }
                        },
                        hostel: {
                            select: {
                                id: true,
                                hostelName: true,
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

        return NextResponse.json(payments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}