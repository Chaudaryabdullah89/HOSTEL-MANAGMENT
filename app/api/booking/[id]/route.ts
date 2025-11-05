import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { updateRoomStatusBasedOnCapacity, updateAllRoomStatuses } from "@/lib/room-utils";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bookingId } = await params;

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
            where: { id: bookingId },
            include: {
                room: true,
                payments: true
            }
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        if (booking.status === "CHECKED_OUT") {
            return NextResponse.json(
                { error: "Cannot delete checked-out bookings as they are considered completed" },
                { status: 400 }
            );
        }

        if (booking.payments && booking.payments.length > 0) {
            await prisma.payment.deleteMany({
                where: { bookingId }
            });
        }


        await prisma.booking.delete({
            where: { id: bookingId }
        });

        if (booking.roomId) {
            await updateRoomStatusBasedOnCapacity(booking.roomId);
        }


        await updateAllRoomStatuses();

        return NextResponse.json(
            { message: "Booking deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting booking:", error);
        return NextResponse.json(
            { error: `Failed to delete booking: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}
