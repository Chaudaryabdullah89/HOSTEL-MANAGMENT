import { NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";

export async function GET() {
  try {
    await ensureConnection();
    const hostels = await prisma.hostel.findMany({

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        hostelName: true,
        address: {
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
            country: true,
            zipcode: true,
          },
        },
        hostelType: true,
        hostelsStatus: true,
        contact: true,
        floors: true,
        description: true,
        amenities: true,
        // capacity: true,
        // occupiedRooms: true,
        // image: true,
        // revenue: true,
        createdAt: true,
        updatedAt: true,
        wardensIds: true,
        wardens: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    });


    return NextResponse.json(hostels);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch hostels" },
      { status: 500 }
    );
  }
}