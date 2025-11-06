import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { googleSheetsService } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        // if (!session) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        // // Check if user is admin
        // if (session.user?.role !== 'ADMIN') {
        //     return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        // }

        // Initialize the Google Sheets
        await googleSheetsService.initializeSpreadsheet();

        return NextResponse.json({
            message: "Google Sheets initialized successfully",
            sheets: [
                "Bookings",
                "Payments",
                "Rooms",
                "Maintenance",
                "Users",
                "Expenses",
                "Salaries"
            ]
        });

    } catch (error) {
        console.error("Error initializing Google Sheets:", error);
        return NextResponse.json(
            { error: "Failed to initialize Google Sheets" },
            { status: 500 }
        );
    }
}
