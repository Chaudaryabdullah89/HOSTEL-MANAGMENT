import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
    const bookings = await prisma.booking.findMany({
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
            payment: {
                select: {
                    id: true,
                    amount: true,
                    method: true,
                    status: true,
                    transactionId: true,
                    notes: true,
                    createdAt: true,
                    updatedAt: true,
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