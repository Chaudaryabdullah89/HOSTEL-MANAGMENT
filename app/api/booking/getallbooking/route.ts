import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWardenAuth } from "@/lib/warden-auth";

export async function GET(request: NextRequest) {
    try {
        // Check if user is warden and get their hostel assignments
        let wardenHostelIds: string[] = [];
        try {
            const wardenAuth = await requireWardenAuth(request);
            wardenHostelIds = wardenAuth.hostelIds;
        } catch (error) {
            // If not a warden, continue without filtering (admin access)
            console.log("No warden auth, showing all bookings");
        }

        const whereClause = wardenHostelIds.length > 0
            ? { hostelId: { in: wardenHostelIds } }
            : {};

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                room: {
                    select: {
                        id: true,
                        roomNumber: true,
                        type: true,
                        pricePerNight: true,
                        pricePerMonth: true,
                        status: true,
                        amenities: true,
                        floor: true,
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true,
                        floors: true,
                        amenities: true,
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                },
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionId: true,
                        notes: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 }
        );
    }
}