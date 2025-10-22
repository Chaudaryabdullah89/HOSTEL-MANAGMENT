import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

interface WardenAuthResult {
    user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
    };
    hostelIds: string[];
}

/**
 * Get warden's assigned hostel IDs
 * @param userId - The user ID to check
 * @returns Array of hostel IDs assigned to the warden
 */
export async function getWardenHostels(userId: string): Promise<string[]> {
    try {
        const warden = await prisma.warden.findUnique({
            where: { userId },
            select: { hostelIds: true }
        });

        return warden?.hostelIds || [];
    } catch (error) {
        console.error("Error fetching warden hostels:", error);
        return [];
    }
}

/**
 * Verify user is a warden and get their assigned hostels
 * @param request - The incoming request
 * @returns Warden authentication result with user info and hostel IDs
 */
export async function requireWardenAuth(request: Request): Promise<WardenAuthResult> {
    try {
        // Extract token from cookies
        const cookieHeader = request.headers.get("cookie");

        if (!cookieHeader) {
            throw new Error("No cookies found");
        }

        const token = cookieHeader
            ?.split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            throw new Error("No token provided");
        }

        // Verify the JWT token
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET not configured");
        }
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        // Fetch user data with warden info
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                wardens: {
                    select: {
                        hostelIds: true
                    }
                }
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Check if user is a warden
        if (user.role !== 'WARDEN') {
            throw new Error("User is not a warden");
        }

        const wardenRecord = user.wardens[0];
        const hostelIds = wardenRecord?.hostelIds || [];

        if (hostelIds.length === 0) {
            throw new Error("Warden not assigned to any hostels");
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            hostelIds
        };
    } catch (error) {
        console.error("Warden auth verification error:", error);
        throw new Error(error instanceof Error ? error.message : "Invalid or expired token");
    }
}

/**
 * Check if user has access to a specific hostel
 * @param userId - The user ID to check
 * @param hostelId - The hostel ID to verify access to
 * @returns Boolean indicating if user has access
 */
export async function hasHostelAccess(userId: string, hostelId: string): Promise<boolean> {
    try {
        const hostelIds = await getWardenHostels(userId);
        return hostelIds.includes(hostelId);
    } catch (error) {
        console.error("Error checking hostel access:", error);
        return false;
    }
}
