import { NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";

export async function GET() {
  try {
    await ensureConnection();
    const rooms = await prisma.room.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        roomNumber: true,
        type: true,
        status: true,
        floor: true,
        capacity: true,
        pricePerNight: true,
        pricePerMonth: true,
        // securityDeposit: true,
        amenities: true,
        notes: true,
        image: true,
        hostelId: true,
        createdAt: true,
        updatedAt: true,
        // Optionally, include the hostel details
        hostel: {
          select: {
            id: true,
            hostelName: true,
          },
        },
      },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
