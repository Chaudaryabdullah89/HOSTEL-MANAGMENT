import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { UserRole } from "@prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    console.log("[Update-Role] Session info:", session);

    if (!session?.loggedIn) {
      console.warn("[Update-Role] Unauthorized access attempt (not logged in)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      console.warn(
        `[Update-Role] Access denied. User '${session.user.id}' (${session.user.email}) is not ADMIN`
      );
      return NextResponse.json(
        { error: "Only admins can update user roles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, newRole, hostelId: hostelIds } = body;
    console.log("[Update-Role] Request body:", { userId, newRole, hostelIds });

    if (!userId || !newRole) {
      console.warn("[Update-Role] Missing required fields: userId or newRole");
      return NextResponse.json(
        { error: "Missing required fields: userId and newRole" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = Object.values(UserRole).map(String);
    if (!validRoles.includes(newRole.toUpperCase())) {
      console.warn(
        `[Update-Role] Invalid role '${newRole}'. Must be one of: ${validRoles.join(", ")}`
      );
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin: true,
        wardens: true,
        guest: true,
      },
    });

    if (!currentUser) {
      console.warn(`[Update-Role] User not found: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentRole = currentUser.role;
    const newRoleUpper = newRole.toUpperCase();

    if (currentRole === newRoleUpper) {
      console.info(
        `[Update-Role] No update needed. User '${userId}' already has role '${currentRole}'`
      );
      return NextResponse.json({
        message: "User already has this role",
        user: currentUser,
      });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Remove existing role relations first
      if (currentRole === "ADMIN" && currentUser.admin) {
        console.debug(`[Update-Role] Removing ADMIN relation for user ${userId}`);
        await tx.admin.delete({
          where: { userId: userId },
        });
      }

      if (currentRole === "WARDEN" && currentUser.wardens && currentUser.wardens.length > 0) {
        console.debug(`[Update-Role] Removing WARDEN relations for user ${userId}`);
        await tx.warden.deleteMany({
          where: { userId: userId },
        });
      }

      if (currentRole === "GUEST" && currentUser.guest) {
        console.debug(`[Update-Role] Removing GUEST relation for user ${userId}`);
        await tx.guest.delete({
          where: { userId: userId },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: newRoleUpper as UserRole },
      });

      // Add the new role relationships
      if (newRoleUpper === "ADMIN") {
        console.debug(`[Update-Role] Creating new ADMIN relation for user ${userId}`);
        await tx.admin.create({
          data: { userId: userId },
        });
      } else if (newRoleUpper === "WARDEN") {
        if (!hostelIds) {
          console.warn("[Update-Role] hostelId is required when assigning WARDEN role");
          throw new Error("hostelId is required when assigning WARDEN role");
        }

        const hostelIdsArr: string[] = Array.isArray(hostelIds)
          ? hostelIds
          : [hostelIds];

        console.debug(`[Update-Role] Syncing WARDEN role for user ${userId} - hostels:`, hostelIdsArr);

        await tx.warden.upsert({
          where: { userId },
          update: { hostelIds: hostelIdsArr },
          create: { userId, hostelIds: hostelIdsArr },
        });

        // ✅ Remove previous warden references from all hostels
        await tx.hostel.updateMany({
          where: { wardensIds: { has: userId } },
          data: {
            wardensIds: {
              set: [], // fully clean before reassign
            },
          },
        });

        // ✅ Add correct hostel assignments without duplication
        for (const hId of hostelIdsArr) {
          await tx.hostel.update({
            where: { id: hId },
            data: {
              wardensIds: {
                push: userId,
              },
              wardens: {
                connect: { id: userId } // ✅ ensure Prisma relation sync
              }
            },
          });
        }

        console.log(`[Update-Role] ✅ User ${userId} is now WARDEN of:`, hostelIdsArr);
      } else if (newRoleUpper === "GUEST") {
        console.debug(`[Update-Role] Upserting GUEST relation for user ${userId}`);
        await tx.guest.upsert({
          where: { userId: userId },
          update: {},
          create: {
            userId: userId,
          },
        });
      }

      return updatedUser;
    });

    console.info(
      `[Update-Role] User '${userId}' role changed from '${currentRole}' to '${newRoleUpper}' by ADMIN '${session.user.id}'`
    );

    return NextResponse.json({
      message: `User role updated from ${currentRole} to ${newRoleUpper}`,
      user: result,
    });
  } catch (error: any) {
    // Enhanced logging
    console.error("[Update-Role] Error updating user role:", error);

    // More human-friendly error if possible
    let errorMsg = "Internal Server Error";
    if (error instanceof Error && error.message) {
      errorMsg = error.message;
    } else if (typeof error === "string") {
      errorMsg = error;
    }

    return NextResponse.json(
      {
        error: errorMsg,
        details: process.env.NODE_ENV === "development" ? String(error?.stack || error) : undefined,
      },
      { status: 500 }
    );
  }
}
