import { NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";
import { requireWardenAuth } from "@/lib/warden-auth";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: Request) {
  const requestStart = Date.now();
  try {
    await ensureConnection();
    console.log(`[ROOMS][${new Date().toISOString()}] Database connection ensured.`);
    console.log(`[ROOMS][${new Date().toISOString()}] Incoming GET request to getallrooms endpoint.`);

    let wardenHostelIds: string[] = [];
    let actingRole = "UNKNOWN";
    let actingUser: string | undefined = undefined;

    // Make warden auth optional: try, but if not available, just act as ADMIN or PUBLIC
    let wardenTried = false;
    try {
      const wardenAuth = await requireWardenAuth(request);
      wardenHostelIds = wardenAuth.hostelIds;
      actingRole = "WARDEN";
      actingUser = wardenAuth.user?.email || "unknown-warden";
      wardenTried = true;
      console.log(`[ROOMS][${new Date().toISOString()}] Warden authorized: ${actingUser}. Assigned hostelIds: ${wardenHostelIds.join(",") || "NONE"}`);
    } catch (error) {
      // Warden auth failed or not relevant, so just stay empty and become ADMIN or PUBLIC
      console.log(`[ROOMS][${new Date().toISOString()}] No valid warden session found; proceeding with admin or public access.`);
    }

    // If not a warden, check if authenticated admin, otherwise show all rooms (public access)
    if (!wardenTried || wardenHostelIds.length === 0) {
      try {
        const session = await getServerSession(request);
        if (session && session.user.role === "ADMIN") {
          actingRole = "ADMIN";
          actingUser = session.user.email || "unknown-admin";
          console.log(`[ROOMS][${new Date().toISOString()}] Admin access granted for user: ${actingUser}. Showing all rooms.`);
        } else {
          actingRole = "PUBLIC";
          actingUser = undefined;
          console.log(`[ROOMS][${new Date().toISOString()}] Public access - showing all rooms.`);
        }
      } catch (error) {
        actingRole = "PUBLIC";
        actingUser = undefined;
        console.log(`[ROOMS][${new Date().toISOString()}] Public access (session check failed) - showing all rooms.`);
      }
    }

    // For PUBLIC or ADMIN -> whereClause: {} (show all), for WARDEN -> restrict
    const whereClause =
      actingRole === "WARDEN" && wardenHostelIds.length > 0
        ? { hostelId: { in: wardenHostelIds } }
        : {};

    console.log(
      `[ROOMS][${new Date().toISOString()}] Querying rooms. Role: ${actingRole}, User: ${actingUser}, whereClause: ${JSON.stringify(whereClause)}`
    );

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
        hostel: {
          select: {
            id: true,
            hostelName: true,
          },
        },
      },
    });

    console.log(
      `[ROOMS][${new Date().toISOString()}] ${rooms.length} rooms fetched for role=${actingRole}, user=${actingUser ?? "public"}.`
    );
    const requestEnd = Date.now();
    console.log(`[ROOMS][${new Date().toISOString()}] Request handled in ${requestEnd - requestStart}ms.`);

    return NextResponse.json(rooms);
  } catch (error: any) {
    const requestEnd = Date.now();
    console.error(
      `[ROOMS][${new Date().toISOString()}] Error fetching rooms: ${error?.message || error}. Stack: ${error?.stack || "no stack"}`
    );
    console.log(`[ROOMS][${new Date().toISOString()}] Request failed in ${requestEnd - requestStart}ms.`);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
