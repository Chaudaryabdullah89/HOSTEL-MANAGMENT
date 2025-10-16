import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    // Verify authentication
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        hostel: {
          select: {
            userId: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED", "CHECKED_IN"]
            }
          },
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to delete this room
    // Only admin or the hostel owner can delete rooms
    const isAdmin = user.role === "ADMIN";
    const isHostelOwner = existingRoom.hostel?.userId === user.id;

    if (!isAdmin && !isHostelOwner) {
      return NextResponse.json(
        { error: "You don't have permission to delete this room" },
        { status: 403 }
      );
    }

    // Check if room has active bookings
    if (existingRoom.bookings.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete room with active bookings. Please cancel or complete all bookings first.",
          activeBookings: existingRoom.bookings.length
        },
        { status: 400 }
      );
    }

    // Delete the room
    await prisma.room.delete({
      where: { id: roomId },
    });

    return NextResponse.json(
      { 
        message: "Room deleted successfully",
        deletedRoomId: roomId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
