import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { UserRole } from "@prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);

    if (!session?.loggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update user roles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, newRole, hostelId: hostelIds } = body;

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "Missing required fields: userId and newRole" },
        { status: 400 }
      );
    }

    const validRoles = Object.values(UserRole).map(String);
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
        user: currentUser,
      });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      if (currentRole === "ADMIN" && currentUser.admin) {
        await tx.admin.delete({
          where: { userId: userId },
        });
      }

      if (currentRole === "WARDEN" && currentUser.wardens && currentUser.wardens.length > 0) {
        await tx.warden.deleteMany({
          where: { userId: userId },
        });
      }

      if (currentRole === "GUEST" && currentUser.guest) {
        await tx.guest.delete({
          where: { userId: userId },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: newRoleUpper as UserRole },
      });

      if (newRoleUpper === "ADMIN") {
        await tx.admin.create({
          data: { userId: userId },
        });
      } else if (newRoleUpper === "WARDEN") {
        if (!hostelIds) {
          throw new Error("hostelId is required when assigning WARDEN role");
        }

        const hostelIdsArr: string[] = Array.isArray(hostelIds)
          ? hostelIds
          : [hostelIds];

        await tx.warden.upsert({
          where: { userId },
          update: { hostelIds: hostelIdsArr },
          create: { userId, hostelIds: hostelIdsArr },
        });

        await tx.hostel.updateMany({
          where: { wardensIds: { has: userId } },
          data: {
            wardensIds: {
              set: [],
            },
          },
        });

        for (const hId of hostelIdsArr) {
          await tx.hostel.update({
            where: { id: hId },
            data: {
              wardensIds: {
                push: userId,
              },
              wardens: {
                connect: { id: userId }
              }
            },
          });
        }
      } else if (newRoleUpper === "GUEST") {
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

    return NextResponse.json({
      message: `User role updated from ${currentRole} to ${newRoleUpper}`,
      user: result,
    });
  } catch (error: any) {
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
