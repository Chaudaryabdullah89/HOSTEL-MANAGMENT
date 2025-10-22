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
            console.log("No warden auth, showing all maintenance requests");
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const hostelId = searchParams.get('hostelId');
        const roomId = searchParams.get('roomId');
        const assignedTo = searchParams.get('assignedTo');
        const search = searchParams.get('search');

        const whereClause: any = {};

        // Add warden hostel filtering
        if (wardenHostelIds.length > 0) {
            whereClause.hostelId = { in: wardenHostelIds };
        }

        if (status) {
            whereClause.status = status;
        }
        if (priority) {
            whereClause.priority = priority;
        }
        if (hostelId) {
            whereClause.hostelId = hostelId;
        }
        if (roomId) {
            whereClause.roomId = roomId;
        }
        if (assignedTo) {
            whereClause.assignedTo = assignedTo;
        }
        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const maintenances = await prisma.maintenance.findMany({
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
                assignee: {
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
                        type: true,
                        floor: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const response = NextResponse.json(maintenances);

        // Add cache headers for better performance
        response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300'); // 2 min cache, 5 min stale
        response.headers.set('ETag', `"maintenance-${Date.now()}"`);

        return response;
    } catch (error) {
        console.error("Error fetching maintenance requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch maintenance requests" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session || !session.loggedIn || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            priority = "MEDIUM",
            roomId,
            hostelId,
            estimatedCost,
            images = []
        } = body;

        if (!title || !description || !hostelId) {
            return NextResponse.json(
                { error: "Title, description, and hostel ID are required" },
                { status: 400 }
            );
        }

        const userExists = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true }
        });

        if (!userExists) {
            return NextResponse.json(
                { error: "User not found in database" },
                { status: 404 }
            );
        }


        const hostelExists = await prisma.hostel.findUnique({
            where: { id: hostelId },
            select: { id: true }
        });

        if (!hostelExists) {
            return NextResponse.json(
                { error: "Hostel not found" },
                { status: 404 }
            );
        }
        if (roomId) {
            const roomExists = await prisma.room.findUnique({
                where: { id: roomId },
                select: { id: true, hostelId: true }
            });

            if (!roomExists) {
                return NextResponse.json(
                    { error: "Room not found" },
                    { status: 404 }
                );
            }


            if (roomExists.hostelId !== hostelId) {
                return NextResponse.json(
                    { error: "Room does not belong to the specified hostel" },
                    { status: 400 }
                );
            }
        }

        const maintenance = await prisma.maintenance.create({
            data: {
                title,
                description,
                priority,
                reportedBy: session.user.id,
                roomId: roomId || null,
                hostelId,
                estimatedCost: estimatedCost || null,
                images: images || []
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
                        type: true,
                        floor: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                }
            }
        });

        return NextResponse.json(maintenance, { status: 201 });
    } catch (error) {
        console.error("Error creating maintenance request:", error);

        // Handle specific Prisma errors
        if (error instanceof Error) {
            if (error.message.includes('Foreign key constraint violated')) {
                return NextResponse.json(
                    { error: "Invalid reference: One or more referenced records do not exist" },
                    { status: 400 }
                );
            }
            if (error.message.includes('Unique constraint failed')) {
                return NextResponse.json(
                    { error: "A record with this information already exists" },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to create maintenance request" },
            { status: 500 }
        );
    }
}
