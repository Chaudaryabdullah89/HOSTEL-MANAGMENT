import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, hostelId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!hostelId) {
      return NextResponse.json(
        { error: "Hostel ID is required" },
        { status: 400 }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if this user is already a warden for this specific hostel
    const existingWarden = await prisma.warden.findFirst({
      where: { 
        userId,
        hostelId 
      }
    });

    // if (existingWarden) {
    //   return NextResponse.json(
    //     { error: "User is already a Warden for this hostel" },
    //     { status: 409 }
    //   );
    // }

    // Create the warden record
    const newWarden = await prisma.warden.create({
      data: {
        user: {
          connect: { id: userId }
        },
        hostel: {
          connect: { id: hostelId }
        }
      },
      include: {
        user: true,
      }
    });

    // Optionally, update user role to "WARDEN" if needed
    if (user.role !== "WARDEN") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "WARDEN" }
      });
    }

    return NextResponse.json({
      message: "Warden created successfully",
      warden: newWarden
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating warden:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
