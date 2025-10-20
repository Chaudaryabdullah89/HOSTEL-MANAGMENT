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
    const existinguser = await prisma.user.findUnique({
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
      var newaddress = await prisma.userAddress.create({
        data: {
          street: address.street || "",
          city: address.city || "",
          state: address.state || "",
          country: address.country || "",
          zipcode: address.zipcode || "",
        },
      });
    }
    const newuser = await prisma.user.create({
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
      await prisma.admin.create({
        data: {
          userId: newuser.id,
        },
      });
    } else if (userRole === "WARDEN") {
      // For warden, we need a hostelId - skip creation for now
      // The warden will be created when they are assigned to a hostel
    } else if (userRole === "GUEST") {
      await prisma.guest.create({
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

    // Send welcome email for self-registered users
    try {
      const emailPayload = {
        type: 'user_welcome',
        userEmail: newuser.email,
        userName: newuser.name
      };

      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mail/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the signup if email fails
    }

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
