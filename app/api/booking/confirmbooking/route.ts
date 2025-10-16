import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function PUT(request: NextRequest) {
    try {
        const { bookingId } = await request.json();
        console.log("Booking ID:", bookingId);
        
        if (!bookingId) {
            return NextResponse.json(
                { error: "Booking ID is required" },
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
                status: "CONFIRMED",
                // checkinconfirmationdate: new Date()
            }
        });
        
        console.log("Booking confirmed successfully:", updatedBooking);
        return NextResponse.json(
            { message: "Booking confirmed", booking: updatedBooking },
            { status: 200 }
        );
    } catch (error) {
        console.error("Booking confirmation error:", error);
        return NextResponse.json(
            { error: "Failed to confirm booking" },
            { status: 500 }
        );
    }
}