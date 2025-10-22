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

        // Check if user is warden and get their hostel assignments
        let wardenHostelIds: string[] = [];
        let isWarden = false;
        try {
            const wardenAuth = await requireWardenAuth(request);
            wardenHostelIds = wardenAuth.hostelIds;
            isWarden = true;
        } catch (error) {
            // If not a warden, continue without filtering (admin access)
            console.log("No warden auth, showing all users");
        }

        let users;
        if (isWarden) {
            // For wardens, only show guests from their assigned hostels
            users = await prisma.user.findMany({
                where: {
                    role: 'GUEST',
                    guest: {
                        hostelId: {
                            in: wardenHostelIds
                        }
                    }
                },
                include: {
                    guest: {
                        include: {
                            Hostel: {
                                select: {
                                    id: true,
                                    hostelName: true
                                }
                            }
                        }
                    }
                }
            });
        } else {
            // For admins, show all users
            users = await prisma.user.findMany();
        }

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}