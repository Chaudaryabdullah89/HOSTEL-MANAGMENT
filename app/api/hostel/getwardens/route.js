import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // assumes Prisma is setup in /lib/prisma.js

export async function GET() {
  try {
    // Fetch all users with WARDEN role
    const users = await prisma.user.findMany({
      where: {
        role: 'WARDEN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        wardens: {
          select: {
            hostelIds: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });

    // Get hostel information for wardens
    const transformedWardens = [];

    for (const user of users) {
      const wardenRecord = user.wardens[0]; // Should only be one record per user
      const hostelIds = wardenRecord?.hostelIds || [];

      if (hostelIds.length > 0) {
        // Fetch hostel names for this warden
        const hostels = await prisma.hostel.findMany({
          where: {
            id: { in: hostelIds }
          },
          select: {
            id: true,
            hostelName: true
          }
        });

        const hostelNames = hostels.map(h => h.hostelName).join(', ');

        transformedWardens.push({
          id: wardenRecord?.id || user.id,
          name: user.name,
          email: user.email,
          userId: user.id,
          hostelIds: hostelIds,
          hostelNames: hostelNames
        });
      } else {
        // Warden not assigned to any hostel yet
        transformedWardens.push({
          id: user.id,
          name: user.name,
          email: user.email,
          userId: user.id,
          hostelIds: [],
          hostelNames: 'Not assigned'
        });
      }
    }

    return NextResponse.json(transformedWardens || []);
  } catch (error) {
    console.error("Error fetching wardens:", error);
    return NextResponse.json({ error: "Failed to fetch wardens" }, { status: 500 });
  }
}
