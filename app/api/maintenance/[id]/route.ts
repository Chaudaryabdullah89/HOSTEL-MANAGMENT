import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const maintenance = await prisma.maintenance.findUnique({
            where: { id: params.id },
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
            }
        });

        if (!maintenance) {
            return NextResponse.json({ error: "Maintenance request not found" }, { status: 404 });
        }

        return NextResponse.json(maintenance);
    } catch (error) {
        console.error("Error fetching maintenance request:", error);
        return NextResponse.json(
            { error: "Failed to fetch maintenance request" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            priority,
            status,
            assignedTo,
            estimatedCost,
            actualCost,
            notes,
            images
        } = body;

        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;
        if (status !== undefined) {
            updateData.status = status;
            // Set timestamps based on status
            if (status === "IN_PROGRESS" && !updateData.startedAt) {
                updateData.startedAt = new Date();
            }
            if (status === "COMPLETED" && !updateData.completedAt) {
                updateData.completedAt = new Date();
            }
        }
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
        if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
        if (actualCost !== undefined) updateData.actualCost = actualCost;
        if (notes !== undefined) updateData.notes = notes;
        if (images !== undefined) updateData.images = images;

        const maintenance = await prisma.maintenance.update({
            where: { id: params.id },
            data: updateData,
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
            }
        });

        return NextResponse.json(maintenance);
    } catch (error) {
        console.error("Error updating maintenance request:", error);
        return NextResponse.json(
            { error: "Failed to update maintenance request" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user has permission to delete (admin or the one who reported)
        const maintenance = await prisma.maintenance.findUnique({
            where: { id: params.id },
            select: { reportedBy: true }
        });

        if (!maintenance) {
            return NextResponse.json({ error: "Maintenance request not found" }, { status: 404 });
        }

        // Only allow deletion if user is admin or the one who reported
        if (session.user.role !== "ADMIN" && maintenance.reportedBy !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized to delete this request" }, { status: 403 });
        }

        await prisma.maintenance.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "Maintenance request deleted successfully" });
    } catch (error) {
        console.error("Error deleting maintenance request:", error);
        return NextResponse.json(
            { error: "Failed to delete maintenance request" },
            { status: 500 }
        );
    }
}
