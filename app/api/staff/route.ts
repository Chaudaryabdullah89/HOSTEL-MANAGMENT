import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { requireWardenAuth } from "@/lib/warden-auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is warden and get their hostel assignments
        let wardenHostelIds: string[] = [];
        try {
            const wardenAuth = await requireWardenAuth(request);
            wardenHostelIds = wardenAuth.hostelIds;
        } catch (error) {
            // If not a warden, continue without filtering (admin access)
            console.log("No warden auth, showing all staff");
        }

        const { searchParams } = new URL(request.url);
        const hostelId = searchParams.get('hostelId');
        const isActive = searchParams.get('isActive');
        const department = searchParams.get('department');

        const whereClause: any = {};

        if (hostelId) {
            whereClause.hostelId = hostelId;
        }
        if (isActive !== null) {
            whereClause.isActive = isActive === 'true';
        }
        if (department) {
            whereClause.department = department;
        }

        // Add warden filtering for staff
        if (wardenHostelIds.length > 0) {
            whereClause.hostelId = { in: wardenHostelIds };
        }

        const existingStaff = await prisma.staff.findMany({
            where: whereClause,
            include: {
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        const usersWithStaffRoles = await prisma.user.findMany({
            where: {
                role: {
                    in: ["STAFF", "WARDEN", "ADMIN"]
                },
                email: {
                    notIn: existingStaff.map((staff: any) => staff.email)
                },
                // Add warden filtering for users
                ...(wardenHostelIds.length > 0 && {
                    hostelId: { in: wardenHostelIds }
                })
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                hostelId: true
            }
        });

        const usersAsStaff = usersWithStaffRoles.map((user: any) => ({
            id: user.id,
            name: user.name || 'Unknown User',
            email: user.email,
            phone: user.phone || '',
            position: user.role === "ADMIN" ? "Administrator" :
                user.role === "WARDEN" ? "Warden" : "Staff Member",
            department: user.role === "ADMIN" ? "Administration" :
                user.role === "WARDEN" ? "Management" : "Operations",
            hostelId: user.hostelId,
            hostel: user.hostelId ? { hostelName: "Assigned Hostel" } : null,
            isActive: true,
            joinDate: new Date(),
            baseSalary: 0,
            hourlyRate: null
        }));

        const allStaff = [...existingStaff, ...usersAsStaff];

        return NextResponse.json(allStaff);
    } catch (error) {
        console.error("Error fetching staff:", error);
        return NextResponse.json(
            { error: "Failed to fetch staff" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            email,
            phone,
            hostelId,
            position,
            department,
            baseSalary,
            hourlyRate,
            joinDate
        } = body;

        if (!name || !email || !phone || !hostelId) {
            return NextResponse.json(
                { error: "Missing required fields: name, email, phone, hostelId" },
                { status: 400 }
            );
        }

        const hostel = await prisma.hostel.findUnique({
            where: { id: hostelId }
        });

        if (!hostel) {
            return NextResponse.json(
                { error: "Hostel not found" },
                { status: 404 }
            );
        }

        const existingStaff = await prisma.staff.findUnique({
            where: { email }
        });

        if (existingStaff) {
            return NextResponse.json(
                { error: "Staff member with this email already exists" },
                { status: 409 }
            );
        }

        const staff = await prisma.staff.create({
            data: {
                name,
                email,
                phone,
                hostelId,
                position,
                department,
                baseSalary: baseSalary ? parseFloat(baseSalary) : null,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
                joinDate: joinDate ? new Date(joinDate) : new Date()
            },
            include: {
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                }
            }
        });

        return NextResponse.json(staff, { status: 201 });
    } catch (error) {
        console.error("Error creating staff:", error);
        return NextResponse.json(
            { error: "Failed to create staff member" },
            { status: 500 }
        );
    }
}
