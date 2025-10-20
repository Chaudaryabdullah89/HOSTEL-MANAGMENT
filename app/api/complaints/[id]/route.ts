import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(request);
        if (!session || !session.user || !session.user.role) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await ensureConnection();
        
        const complaint = await prisma.complaint.findUnique({
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
            }
        });

        if (!complaint) {
            return NextResponse.json(
                { error: "Complaint not found" },
                { status: 404 }
            );
        }

        // Check permissions
        if (session.user.role === 'GUEST' && complaint.reportedBy !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden - You can only view your own complaints" },
                { status: 403 }
            );
        }

        return NextResponse.json(complaint);
    } catch (error) {
        console.error("Error fetching complaint:", error);
        return NextResponse.json(
            { error: "Failed to fetch complaint" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const { status, priority, assignedTo, adminReply } = body;

        // Check if complaint exists
        const existingComplaint = await prisma.complaint.findUnique({
            where: { id: params.id }
        });

        if (!existingComplaint) {
            return NextResponse.json(
                { error: "Complaint not found" },
                { status: 404 }
            );
        }

        // Check permissions - only admins and wardens can update complaints
        if (!['ADMIN', 'WARDEN'].includes(session.user.role)) {
            return NextResponse.json(
                { error: "Forbidden - Only admins and wardens can update complaints" },
                { status: 403 }
            );
        }

        // Prepare update data
        const updateData: any = {};

        if (status) {
            updateData.status = status;
            if (status === 'RESOLVED' || status === 'CLOSED') {
                updateData.resolvedAt = new Date();
            }
        }

        if (priority) {
            updateData.priority = priority;
        }

        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo || null;
        }

        if (adminReply) {
            updateData.adminReply = adminReply;
            updateData.repliedBy = session.user.id;
            updateData.repliedAt = new Date();
        }

        const updatedComplaint = await prisma.complaint.update({
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
            }
        });

        return NextResponse.json(updatedComplaint);
    } catch (error) {
        console.error("Error updating complaint:", error);
        return NextResponse.json(
            { error: "Failed to update complaint" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(request);
        if (!session || !session.user || !session.user.role) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only admins can delete complaints
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: "Forbidden - Only admins can delete complaints" },
                { status: 403 }
            );
        }

        await ensureConnection();
        
        const complaint = await prisma.complaint.findUnique({
            where: { id: params.id }
        });

        if (!complaint) {
            return NextResponse.json(
                { error: "Complaint not found" },
                { status: 404 }
            );
        }

        await prisma.complaint.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "Complaint deleted successfully" });
    } catch (error) {
        console.error("Error deleting complaint:", error);
        return NextResponse.json(
            { error: "Failed to delete complaint" },
            { status: 500 }
        );
    }
}
