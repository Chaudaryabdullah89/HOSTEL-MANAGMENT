import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
    try {

        const { hostelId } = await request.json();
        if (!hostelId) {
            return NextResponse.json({ error: "Hostel ID is required" }, { status: 400 });
        }
        console.log("HOSTEL ID ", hostelId);
        const hostel = await prisma.hostel.delete({
            where: { id: hostelId },
        });
        return NextResponse.json({ message: "Hostel deleted successfully" , hostel }, { status: 200 });
        console.log("HOSTEL ", hostel);
    }
    catch (error){
        return NextResponse.json({ error: "Failed to delete hostel" }, { status: 500 });
    }   
    
}