import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    const body = await request.json();
    const {
      roomnumber,
      floor,
      capacity,
      pricepernight,
      pricePerMonth,
      securitydeposit,
      notes,
      amenities,
      type,
      status,
      image,
    } = body;

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
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to update this room
    // Only admin or the hostel owner can update rooms
    const isAdmin = user.role === "ADMIN";
    const isHostelOwner = existingRoom.hostel?.userId === user.id;

    if (!isAdmin && !isHostelOwner) {
      return NextResponse.json(
        { error: "You don't have permission to update this room" },
        { status: 403 }
      );
    }

    // Validate room types and statuses
    const validRoomTypes = ["SINGLE", "DOUBLE", "TRIPLE", "QUAD", "DORMITORY"];
    const validRoomStatuses = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "OUT_OF_ORDER"];

    if (type && !validRoomTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid room type. Must be one of: ${validRoomTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (status && !validRoomStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid room status. Must be one of: ${validRoomStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Update the room
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...(roomnumber && { roomNumber: roomnumber }),
        ...(floor !== undefined && { floor: parseInt(floor) }),
        ...(capacity !== undefined && { capacity: parseInt(capacity) }),
        ...(pricepernight !== undefined && { pricePerNight: parseFloat(pricepernight) }),
        ...(pricePerMonth !== undefined && { pricePerMonth: parseFloat(pricePerMonth) }),
        ...(notes !== undefined && { notes }),
        ...(amenities !== undefined && { amenities: Array.isArray(amenities) ? amenities : [] }),
        ...(type && { type }),
        ...(status && { status }),
        ...(image !== undefined && { image }),
      },
      include: {
        hostel: {
          select: {
            id: true,
            hostelName: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(
      { 
        message: "Room updated successfully", 
        room: updatedRoom 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
