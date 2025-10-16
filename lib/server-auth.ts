// Server-side authentication utilities for API routes
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

interface SessionData {
  loggedIn: boolean;
  user: any | null;
  error: string | null;
}

/**
 * Extract and verify JWT token from request headers
 * @param {Request} request - The incoming request
 * @returns {SessionData} - Session data with loggedIn status and user info
 */
export async function getServerSession(request: Request): Promise<SessionData> {
  try {
    // Extract token from cookies
    const cookieHeader = request.headers.get("cookie");
    
    if (!cookieHeader) {
      return { loggedIn: false, user: null, error: "No cookies found" };
    }

    const token = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return { loggedIn: false, user: null, error: "No token provided" };
    }

    // Verify the JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return { loggedIn: false, user: null, error: "JWT_SECRET not configured" };
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        address: {
          select: {
            street: true,
            city: true,
            state: true,
            country: true,
            zipcode: true,
          },
        },
      },
    });

    if (!user) {
      return { loggedIn: false, user: null, error: "User not found" };
    }

    return {
      loggedIn: true,
      user: user,
      error: null,
    };
  } catch (error) {
    console.error("Server session verification error:", error);
    return {
      loggedIn: false,
      user: null,
      error: error instanceof Error ? error.message : "Invalid or expired token",
    };
  }
}
