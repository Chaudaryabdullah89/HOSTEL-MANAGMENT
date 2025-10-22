import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { requireWardenAuth } from "@/lib/warden-auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session || !session.user || !session.user.role) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await ensureConnection();

        // Build where clause based on user role only
        let whereClause: any = {};

        // Check if user is warden and get their hostel assignments
        try {
            const wardenAuth = await requireWardenAuth(request);
            whereClause.hostelId = { in: wardenAuth.hostelIds };
        } catch (error) {
            // If not a warden, continue without filtering (admin access)
            console.log("No warden auth, showing all complaints");

            if (session.user.role === 'GUEST') {
                // Guest can only see their own complaints
                whereClause.reportedBy = session.user.id;
            }
        }

        const complaints = await prisma.complaint.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                room: {
                    select: {
                        id: true,
                        roomNumber: true,
                        floor: true,
                        type: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true,
                        address: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                replier: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ complaints });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        return NextResponse.json(
            { error: "Failed to fetch complaints" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session || !session.user || !session.user.role) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await ensureConnection();

        const body = await request.json();
        const {
            title,
            description,
            category = 'GENERAL',
            priority = 'MEDIUM',
            roomId,
            hostelId,
            images = []
        } = body;

        if (!title || !description || !hostelId) {
            return NextResponse.json(
                { error: "Title, description, and hostel are required" },
                { status: 400 }
            );
        }

        const complaint = await prisma.complaint.create({
            data: {
                title,
                description,
                category,
                priority,
                roomId: roomId || null,
                hostelId,
                reportedBy: session.user.id,
                images
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                room: {
                    select: {
                        id: true,
                        roomNumber: true,
                        floor: true,
                        type: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true,
                        address: true
                    }
                }
            }
        });

        return NextResponse.json(complaint, { status: 201 });
    } catch (error) {
        console.error("Error creating complaint:", error);
        return NextResponse.json(
            { error: "Failed to create complaint" },
            { status: 500 }
        );
    }
}
