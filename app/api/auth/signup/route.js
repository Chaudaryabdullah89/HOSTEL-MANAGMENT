import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

export async function POST(request) {
  try {
    const { email, name, password, image, role, address, phone } =
      await request.json();

    if (!email || !name || !password || !image || !role || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: " + validRoles.join(", ") },
        { status: 400 },
      );
    }
    const existinguser = await prisma.User.findUnique({
      where: {
        email,
      },
    });
    if (existinguser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedpassword = await bcrypt
      .genSalt(10)
      .then((salt) => bcrypt.hash(password, salt).then((hash) => hash));
    
    if (address) {
      var newaddress = await prisma.UserAddress.create({
        data: {
          street: address.street || "",
          city: address.city || "",
          state: address.state || "",
          country: address.country || "",
          zipcode: address.zipcode || "",
        },
      });
    }
    const newuser = await prisma.User.create({
      data: {
        email: email || "",
        name: name || "",
        password: hashedpassword || "",
        phone: phone || "",
        image: image || "",
        role: role ? UserRole[role.toUpperCase()] : UserRole.GUEST,
        addressId: newaddress ? newaddress.id : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        address: true,
      },
    });

    // Create role-specific model based on user role
    const userRole = role ? role.toUpperCase() : "GUEST";
    
    if (userRole === "ADMIN") {
      await prisma.Admin.create({
        data: {
          userId: newuser.id,
        },
      });
    } else if (userRole === "WARDEN") {
      // For warden, we need a hostelId - skip creation for now
      // The warden will be created when they are assigned to a hostel
    } else if (userRole === "GUEST") {
      await prisma.Guest.create({
        data: {
          userId: newuser.id,
        },
      });
    }
    const token = jwt.sign({ id: newuser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });
    return NextResponse.json({
      message: "User created successfully",
      user: newuser,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
