import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { bookingId, status, notes } = await request.json();

        if (!bookingId || !status) {
            return NextResponse.json(
                { error: "Booking ID and status are required" },
                { status: 400 }
            );
        }

        // Get the booking with user information
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                room: {
                    select: {
                        roomNumber: true,
                        type: true
                    }
                },
                hostel: {
                    select: {
                        hostelName: true
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

        // Update booking status
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: status,
                ...(notes && { notes: notes })
            }
        });

        // Create notification for the user
        const notificationMessage = `Your booking for Room ${booking.room.roomNumber} in ${booking.hostel.hostelName} has been ${status.toLowerCase()}`;

        await prisma.notification.create({
            data: {
                type: 'booking',
                message: notificationMessage,
                userId: booking.user.id,
                bookingId: booking.id,
                isRead: false
            }
        });

        // Log the status change for admin tracking
        console.log(`Booking ${bookingId} status changed to ${status} by ${session.user.name} (${session.user.role})`);

        return NextResponse.json({
            message: "Booking status updated successfully",
            booking: updatedBooking,
            notification: {
                message: notificationMessage,
                sentTo: booking.user.name
            }
        });

    } catch (error) {
        console.error("Error updating booking status:", error);
        return NextResponse.json(
            { error: "Failed to update booking status" },
            { status: 500 }
        );
    }
}
