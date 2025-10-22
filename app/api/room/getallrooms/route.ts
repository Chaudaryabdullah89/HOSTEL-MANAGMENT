import { NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";
import { requireWardenAuth } from "@/lib/warden-auth";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    await ensureConnection();

    // Check if user is warden and get their hostel assignments
    let wardenHostelIds: string[] = [];
    try {
      const wardenAuth = await requireWardenAuth(request);
      wardenHostelIds = wardenAuth.hostelIds;
    } catch (error) {
      const session = await getServerSession(request);
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized: Only admins or wardens can view rooms" },
          { status: 403 }
        );
      }
      console.log("Admin access: showing all rooms");
    }

    const whereClause = wardenHostelIds.length > 0
      ? { hostelId: { in: wardenHostelIds } }
      : {};

    const rooms = await prisma.room.findMany({
      where: whereClause,
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
