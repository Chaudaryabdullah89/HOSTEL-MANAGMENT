import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
    try {
        const { name, email, phone, role, address, password } = await request.json();

        // Validate required fields
        if (!name || !email || !phone || !role) {
            return NextResponse.json(
                { error: "Missing required fields: name, email, phone, role" },
                { status: 400 }
            );
        }

        // Validate role
        const validRoles = Object.values(UserRole);
        if (!validRoles.includes(role.toUpperCase())) {
            return NextResponse.json(
                { error: "Invalid role. Must be one of: " + validRoles.join(", ") },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password (use default password if not provided)
        const defaultPassword = password || "defaultPassword123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Create address if provided
        let addressId = null;
        if (address && (address.street || address.city || address.country)) {
            const newAddress = await prisma.userAddress.create({
                data: {
                    street: address.street || "",
                    city: address.city || "",
                    state: address.state || "",
                    country: address.country || "",
                    zipcode: address.zipcode || address.postalCode || "",
                },
            });
            addressId = newAddress.id;
        }

        // Create user
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                phone,
                image: "", // Default empty image
                role: UserRole[role.toUpperCase() as keyof typeof UserRole],
                addressId,
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
        const userRole = role.toUpperCase();

        if (userRole === "ADMIN") {
            await prisma.admin.create({
                data: {
                    userId: newUser.id,
                },
            });
        } else if (userRole === "WARDEN") {
            // For warden, we need a hostelId - skip creation for now
            // The warden will be created when they are assigned to a hostel
        } else if (userRole === "GUEST") {
            await prisma.guest.create({
                data: {
                    userId: newUser.id,
                },
            });
        }

        return NextResponse.json({
            message: "User created successfully",
            user: newUser,
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
