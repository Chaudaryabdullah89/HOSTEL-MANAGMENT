// File: /app/api/auth/sessions/route.ts
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Better cookie parsing
    const cookieHeader = req.headers.get("cookie");

    const token = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        {
          loggedIn: false,
          user: null,
          error: "No token provided",
        },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Ensure database connection is ready
    await ensureConnection();
    
    // Fetch user data from database
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
        address: {
          select: {
            street: true,
            city: true,
            state: true,
            country: true,
            zipcode: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          loggedIn: false,
          user: null,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      loggedIn: true,
      user: user,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        loggedIn: false,
        user: null,
        error: "Invalid or expired token",
      },
      { status: 401 },
    );
  }
}
