import { NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";
import { requireWardenAuth } from "@/lib/warden-auth";

export async function GET(request: Request) {
  try {
    await ensureConnection();

    // Check if user is warden and get their hostel assignments
    let wardenHostelIds: string[] = [];
    try {
      const wardenAuth = await requireWardenAuth(request);
      wardenHostelIds = wardenAuth.hostelIds;
    } catch (error) {
      // If not a warden, continue without filtering (admin access)
      console.log("No warden auth, showing all hostels");
    }

    const whereClause = wardenHostelIds.length > 0
      ? { id: { in: wardenHostelIds } }
      : {};

    const hostels = await prisma.hostel.findMany({
      where: whereClause,
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