import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { googleSheetsService } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roomnumber,
      floor,
      capacity,
      pricepernight,
      pricePerMonth,
      securitydeposit,
      availablebeds,
      notes,
      amenities,
      type,
      status,
      image,
      hostelId,
    } = body;

    const cookieHeader = request.headers.get("cookie");

    const token = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { loggedIn: false, user: null, error: "No token provided" },
        { status: 401 },
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
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        hostelId: true,
        address: {
          select: {
            street: true,
            city: true,
            state: true,
            country: true,
            zipcode: true,
          },
        },

        guest: {
          select: {
            hostelId: true,
          },
        },
        ownedHostels: {
          select: {
            id: true,
          },
        },
      },
    });

    console.log("User details:", user);
    if (!user) {
      return NextResponse.json(
        { loggedIn: false, user: null, error: "User not found" },
        { status: 404 },
      );
    }

    const missingFields = [];
    if (!roomnumber) missingFields.push("roomnumber");
    if (!floor) missingFields.push("floor");
    if (!capacity) missingFields.push("capacity");
    if (!pricepernight) missingFields.push("pricepernight");
    if (!pricePerMonth) missingFields.push("pricePerMonth");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

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


    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
    });

    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    const room = await prisma.room.create({
      data: {
        roomNumber: roomnumber,
        floor,
        capacity,
        pricePerNight: pricepernight,
        pricePerMonth: pricePerMonth,
        // securityDeposit: securitydeposit,
        notes,
        amenities: amenities || [],
        type: type || "SINGLE",
        status: status || "AVAILABLE",
        image: image || null,
        hostelId: hostel.id || null,
      },
    });

    // Add room to Google Sheets
    try {
      await googleSheetsService.addRoom({
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        type: room.type,
        status: room.status,
        pricePerNight: room.pricePerNight,
        pricePerMonth: room.pricePerMonth,
        createdAt: room.createdAt
      });
    } catch (sheetsError) {
      console.error('Failed to add room to Google Sheets:', sheetsError);
      // Don't fail the room creation if Google Sheets fails
    }

    return NextResponse.json(
      { message: "Room created successfully", room },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}