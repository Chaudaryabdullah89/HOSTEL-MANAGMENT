import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { BookingStatus } from "@prisma/client";
import { updateRoomStatusBasedOnCapacity, updateAllRoomStatuses } from "@/lib/room-utils";

// Ensure environment variables are loaded
if (!process.env.DATABASE_URL) {
    require('dotenv').config();
}

export async function PUT(request: NextRequest) {
    try {
        const { bookingId, status } = await request.json();

        if (!bookingId) {
            return NextResponse.json(
                { error: "Booking ID is required" },
                { status: 400 }
            );
        }
        if (typeof bookingId !== 'string') {
            return NextResponse.json(
                { error: "Invalid booking ID format" },
                { status: 400 }
            );
        }


        const validStatuses = Object.values(BookingStatus);
        if (!validStatuses.includes(status as BookingStatus)) {
            return NextResponse.json(
                { error: `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                room: {
                    select: {
                        roomNumber: true,
                        hostel: {
                            select: {
                                hostelName: true
                            }
                        }
                    }
                }
            }
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: status as BookingStatus,
                // checkinconfirmationdate: new Date()
            }
        });

        // Update room status based on capacity if booking has a room
        if (updatedBooking.roomId) {
            await updateRoomStatusBasedOnCapacity(updatedBooking.roomId);
        }

        // Also update all room statuses to ensure consistency
        await updateAllRoomStatuses();

        // Send booking status update email notification
        try {
            const emailPayload = {
                type: 'booking_status_update',
                userEmail: booking.user.email,
                userName: booking.user.name,
                bookingId: booking.id,
                roomNumber: booking.room.roomNumber,
                hostelName: booking.room.hostel.hostelName,
                previousStatus: booking.status,
                newStatus: status,
                notes: `Booking status updated to ${status}`
            };

            await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mail/send-notification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(emailPayload),
            });
        } catch (emailError) {
            console.error("Error sending booking status update email:", emailError);
            // Don't fail the booking update if email fails
        }

        return NextResponse.json(
            { message: "Booking status updated", booking: updatedBooking },
            { status: 200 }
        );
    } catch (error) {
        console.error("Booking confirmation error:", error);
        return NextResponse.json(
            { error: `Failed to update booking: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}