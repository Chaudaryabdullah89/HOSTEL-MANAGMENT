import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { UserRole } from "@prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session.loggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can update user roles" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, newRole, hostelId: hostelIds } = body;
    console.log(userId, newRole, hostelIds)

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "Missing required fields: userId and newRole" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(newRole.toUpperCase())) {
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentRole = currentUser.role;
    const newRoleUpper = newRole.toUpperCase();

    if (currentRole === newRoleUpper) {
      return NextResponse.json({
        message: "User already has this role",
        user: currentUser
      });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: newRoleUpper as UserRole },
      });

      if (newRoleUpper === "WARDEN") {
        await tx.warden.create({
          data: { userId: userId, hostelIds: [hostelIds] },
        });
      }


      if (currentRole === "ADMIN" && currentUser.admin) {
        await tx.admin.delete({
          where: { userId: userId },
        });
      } else if (currentRole === "WARDEN" && currentUser.wardens.length > 0) {


        await tx.warden.deleteMany({
          where: { userId: userId },
        });
      } else if (currentRole === "GUEST" && currentUser.guest) {
        await tx.guest.delete({
          where: { userId: userId },
        });
      }

      if (newRoleUpper === "ADMIN") {
        await tx.admin.create({
          data: { userId: userId },
        });
      } else if (newRoleUpper === "WARDEN") {
        // Warden role assigned, but Warden model will be created when assigned to a hostel
      } else if (newRoleUpper === "GUEST") {
        await tx.guest.create({
          data: { userId: userId },
        });
      }

      return updatedUser;
    });

    return NextResponse.json({
      message: `User role updated from ${currentRole} to ${newRoleUpper}`,
      user: result,
    });

  } catch (error) {
    // Still log error to server for debugging purposes.
    // Remove or comment this out if absolutely NO console output is required.
    // console.error("Error updating user role:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
