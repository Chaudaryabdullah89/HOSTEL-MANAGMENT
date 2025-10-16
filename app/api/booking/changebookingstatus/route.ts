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
        const { bookingId , status } = await request.json();
        
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
            where: { id: bookingId }
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