import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { requireWardenAuth } from "@/lib/warden-auth";

// Get all salaries
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
            console.log("No warden auth, showing all salaries");
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const payPeriod = searchParams.get('payPeriod');
        const staffId = searchParams.get('staffId');

        const whereClause: any = {};

        if (status) {
            whereClause.status = status;
        }
        if (payPeriod) {
            whereClause.payPeriod = payPeriod;
        }
        if (staffId) {
            whereClause.staffId = staffId;
        }

        // Add warden filtering for salaries
        if (wardenHostelIds.length > 0) {
            whereClause.staff = {
                hostelId: { in: wardenHostelIds }
            };
        }

        const salaries = await prisma.salary.findMany({
            where: whereClause,
            include: {
                staff: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        position: true,
                        department: true,
                        hostel: {
                            select: {
                                hostelName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                payDate: 'desc'
            }
        });

        return NextResponse.json(salaries);
    } catch (error) {
        console.error("Error fetching salaries:", error);
        return NextResponse.json(
            { error: "Failed to fetch salaries" },
            { status: 500 }
        );
    }
}

// Create new salary
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            staffId,
            amount,
            currency = "PKR",
            payPeriod,
            payDate,
            baseAmount,
            overtimeAmount = 0,
            bonusAmount = 0,
            deductions = 0,
            netAmount,
            notes
        } = body;

        // Validate required fields
        if (!staffId || !amount || !payPeriod || !payDate || !baseAmount || !netAmount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // First, try to find if staffId is a staff record ID
        let staffRecord = await prisma.staff.findUnique({
            where: { id: staffId }
        });

        // If not found, check if it's a User ID (for users without staff records)
        if (!staffRecord) {
            const user = await prisma.user.findUnique({
                where: { id: staffId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phone: true,
                    hostelId: true
                }
            });

            if (!user) {
                return NextResponse.json(
                    { error: "Staff member or user not found" },
                    { status: 404 }
                );
            }

            // Validate user role
            const validRoles = ["STAFF", "WARDEN", "ADMIN"];
            if (!validRoles.includes(user.role)) {
                return NextResponse.json(
                    { error: "User role does not qualify for salary payments" },
                    { status: 400 }
                );
            }

            // Check if staff record exists by email, if not create one
            staffRecord = await prisma.staff.findFirst({
                where: { email: user.email }
            });

            if (!staffRecord) {
                // Get a default hostel ID if user doesn't have one assigned
                let defaultHostelId = user.hostelId;
                if (!defaultHostelId) {
                    const defaultHostel = await prisma.hostel.findFirst();
                    defaultHostelId = defaultHostel?.id || null;
                }

                if (!defaultHostelId) {
                    return NextResponse.json(
                        { error: "No hostel found. Please assign a hostel to the user or create a hostel first." },
                        { status: 400 }
                    );
                }

                // Create staff record for the user
                staffRecord = await prisma.staff.create({
                    data: {
                        name: user.name || 'Unknown User',
                        email: user.email,
                        phone: user.phone || '',
                        hostelId: defaultHostelId,
                        position: user.role === "ADMIN" ? "Administrator" :
                            user.role === "WARDEN" ? "Warden" : "Staff Member",
                        department: user.role === "ADMIN" ? "Administration" :
                            user.role === "WARDEN" ? "Management" : "Operations",
                        baseSalary: 0, // Default value, can be updated later
                        isActive: true,
                        joinDate: new Date()
                    }
                });
            }
        }

        // Use the staff record ID for salary creation
        const actualStaffId = staffRecord.id;

        const salary = await prisma.salary.create({
            data: {
                staffId: actualStaffId,
                amount,
                currency,
                payPeriod,
                payDate: new Date(payDate),
                baseAmount,
                overtimeAmount,
                bonusAmount,
                deductions,
                netAmount,
                notes,
                processedBy: session.user.id,
                processedAt: new Date()
            }
        });

        // Return salary with staff information
        const salaryWithStaff = {
            ...salary,
            staff: {
                id: staffRecord.id,
                name: staffRecord.name,
                email: staffRecord.email,
                position: staffRecord.position,
                department: staffRecord.department,
                hostel: staffRecord.hostelId ? { hostelName: "Assigned Hostel" } : null
            }
        };

        return NextResponse.json(salaryWithStaff, { status: 201 });
    } catch (error) {
        console.error("Error creating salary:", error);
        return NextResponse.json(
            { error: "Failed to create salary" },
            { status: 500 }
        );
    }
}
