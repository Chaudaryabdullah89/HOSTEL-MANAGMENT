import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { updateAllRoomStatuses } from "@/lib/room-utils";

// Ensure environment variables are loaded
if (!process.env.DATABASE_URL) {
    require('dotenv').config();
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        // Update all room statuses
        await updateAllRoomStatuses();
        
        return NextResponse.json({
            message: "All room statuses updated successfully"
        });
        
    } catch (error) {
        console.error("Room status update error:", error);
        return NextResponse.json(
            { error: "Failed to update room statuses" },
            { status: 500 }
        );
    }
}
