import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    // Verify room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        roomNumber: true,
        hostel: {
          select: {
            id: true,
            hostelName: true,
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Fetch guests currently staying in this room
    const guests = await prisma.guest.findMany({
      where: {
        guestInRooms: {
          some: {
            id: roomId
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          }
        },
        Hostel: {
          select: {
            id: true,
            hostelName: true,
          }
        }
      }
    });

    // Also fetch active bookings for this room to get more guest information
    const activeBookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        checkin: 'desc'
      }
    });

    return NextResponse.json({
      room: room,
      guests: guests,
      activeBookings: activeBookings,
      totalGuests: guests.length,
      totalActiveBookings: activeBookings.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching room guests:", error);
    return NextResponse.json(
      { error: "Failed to fetch room guests" },
      { status: 500 }
    );
  }
}
