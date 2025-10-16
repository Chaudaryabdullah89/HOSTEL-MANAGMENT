import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { isRoomAvailableForBooking } from "@/lib/room-utils";

// Ensure environment variables are loaded
if (!process.env.DATABASE_URL) {
    require('dotenv').config();
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        
        if (!roomId) {
            return NextResponse.json(
                { error: "Room ID is required" },
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
        
        // Check room availability
        const availability = await isRoomAvailableForBooking(roomId);
        
        return NextResponse.json({
            available: availability.available,
            reason: availability.reason,
            roomId: roomId
        });
        
    } catch (error) {
        console.error("Room availability check error:", error);
        return NextResponse.json(
            { error: "Failed to check room availability" },
            { status: 500 }
        );
    }
}
