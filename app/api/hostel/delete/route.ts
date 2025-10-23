import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
    try {
        const { hostelId } = await request.json();
        if (!hostelId) {
            return NextResponse.json({ error: "Hostel ID is required" }, { status: 400 });
        }

        console.log("HOSTEL ID ", hostelId)
        const existingHostel = await prisma.hostel.findUnique({
            where: { id: hostelId },
            include: {

                staff: true,
                rooms: true,
                bookings: true,
                payments: true,
                maintenances: true
            }
        });

        if (!existingHostel) {
            return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
        }

        await prisma.staff.deleteMany({
            where: { hostelId: hostelId }
        });
        await prisma.warden.deleteMany({
            where: { hostelIds: { has: hostelId } }
        });
        await prisma.room.deleteMany({
            where: { hostelId: hostelId }
        });

        await prisma.booking.deleteMany({
            where: { hostelId: hostelId }
        });

        await prisma.payment.deleteMany({
            where: { hostelId: hostelId }
        });

        await prisma.maintenance.deleteMany({
            where: { hostelId: hostelId }
        });

        const deletedHostel = await prisma.hostel.delete({
            where: { id: hostelId }
        });

        await prisma.hostelAddress.delete({
            where: { id: existingHostel.addressId }
        });

        return NextResponse.json({ message: "Hostel deleted successfully", hostel: deletedHostel }, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to delete hostel" }, { status: 500 });
    }
}