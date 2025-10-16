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
                Warden: true,
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
        
        // Remove warden relationships from this hostel (but keep warden records)
        await prisma.warden.updateMany({
            where: { hostelId: hostelId },
            data: { hostelId: null }
        });
        
        // Delete staff
        await prisma.staff.deleteMany({
            where: { hostelId: hostelId }
        });
        
        // Note: Guests are not directly tied to hostels in the current schema
        
        // Delete rooms (this will cascade to room-related records)
        await prisma.room.deleteMany({
            where: { hostelId: hostelId }
        });
        
        // Delete bookings
        await prisma.booking.deleteMany({
            where: { hostelId: hostelId }
        });
        
        // Delete payments
        await prisma.payment.deleteMany({
            where: { hostelId: hostelId }
        });
        
        // Delete maintenances
        await prisma.maintenance.deleteMany({
            where: { hostelId: hostelId }
        });
        
        // Finally delete the hostel
        const deletedHostel = await prisma.hostel.delete({
            where: { id: hostelId }
        });
        
        // Delete the hostel address after the hostel is deleted
        await prisma.hostelAddress.delete({
            where: { id: existingHostel.addressId }
        });
        
        console.log("HOSTEL DELETED ", deletedHostel);
        return NextResponse.json({ message: "Hostel deleted successfully", hostel: deletedHostel }, { status: 200 });
    }
    catch (error) {
        console.error("Error deleting hostel:", error);
        return NextResponse.json({ error: "Failed to delete hostel" }, { status: 500 });
    }
}