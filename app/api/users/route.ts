import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

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
        
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const hostelId = searchParams.get('hostelId');
        
        // Build where clause
        const where: any = {};
        
        if (role) {
            // Handle multiple roles (comma-separated)
            const roles = role.split(',').map(r => r.trim().toUpperCase());
            if (roles.length === 1) {
                where.role = roles[0];
            } else {
                where.role = { in: roles };
            }
        }
        
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        
        if (hostelId) {
            const hostelConditions = [
                { hostelId: hostelId },
                { wardens: { some: { hostelId: hostelId } } },
                { guest: { hostelId: hostelId } }
            ];
            
            if (where.OR) {
                // If we already have OR conditions from search, we need to combine them properly
                where.AND = [
                    { OR: where.OR },
                    { OR: hostelConditions }
                ];
                delete where.OR;
            } else {
                where.OR = hostelConditions;
            }
        }
        
        const users = await prisma.user.findMany({
            where,
            include: {
                address: true,
                admin: true,
                wardens: true,
                guest: true,    
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
