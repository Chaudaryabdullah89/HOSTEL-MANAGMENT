import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { UserRole } from "@prisma/client";

// Get all salary adjustments
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const staffId = searchParams.get('staffId');
        const type = searchParams.get('type');
        const isActive = searchParams.get('isActive');

        const whereClause: any = {};
        
        if (staffId) {
            whereClause.staffId = staffId;
        }
        if (type) {
            whereClause.type = type;
        }
        if (isActive !== null) {
            whereClause.isActive = isActive === 'true';
        }

        const adjustments = await prisma.salaryAdjustment.findMany({
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
                effectiveDate: 'desc'
            }
        });

        return NextResponse.json(adjustments);
    } catch (error) {
        console.error("Error fetching salary adjustments:", error);
        return NextResponse.json(
            { error: "Failed to fetch salary adjustments" },
            { status: 500 }
        );
    }
}

// Create new salary adjustment
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            staffId,
            type,
            amount,
            reason,
            effectiveDate,
            isActive = true,
            notes
        } = body;
        console.log("staffId", staffId);

        // Validate required fields
        if (!staffId || !type || !amount || !reason || !effectiveDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const staff = await prisma.staff.findUnique({
            where: { role: UserRole.STAFF }
        });

        if (!staff) {
            return NextResponse.json(
                { error: "Staff member not found" },
                { status: 404 }
            );
        }

        const adjustment = await prisma.salaryAdjustment.create({
            data: {
                staffId,
                type,
                amount,
                reason,
                effectiveDate: new Date(effectiveDate),
                isActive,
                notes,
                approvedBy: session.user.id,
                approvedAt: new Date()
            },
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
            }
        });

        return NextResponse.json(adjustment, { status: 201 });
    } catch (error) {
        console.error("Error creating salary adjustment:", error);
        return NextResponse.json(
            { error: "Failed to create salary adjustment" },
            { status: 500 }
        );
    }
}
