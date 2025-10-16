import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostelId = searchParams.get("hostelId");

    if (!hostelId) {
      return NextResponse.json({ error: "Hostel ID is required" }, { status: 400 });
    }

    // Verify hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
    });

    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    // Fetch rooms for the hostel
    const rooms = await prisma.room.findMany({
      where: { hostelId: hostelId },
      orderBy: [
        { floor: 'asc' },
        { roomNumber: 'asc' }
      ],
      include: {
        hostel: {
          select: {
            id: true,
            hostelName: true,
          }
        },
        bookings: {
          select: {
            id: true,
            checkin: true,
            checkout: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
