import { NextResponse } from "next/server";

function verifyJWT(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }

        const payload = parts[1];
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        const parsedPayload = JSON.parse(decodedPayload);

        const currentTime = Math.floor(Date.now() / 1000);
        if (parsedPayload.exp && parsedPayload.exp < currentTime) {
            throw new Error('Token expired');
        }

        return parsedPayload;
    } catch (error) {
        throw new Error('Token verification failed: ' + error.message);
    }
}

export default async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Define public routes that don't require authentication
    const isPublicRoute = pathname.startsWith("/api/auth") ||
        pathname.startsWith("/auth") ||
        pathname === "/" ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.startsWith("/api/") ||
        pathname.startsWith("/favicon.ico");

    // Allow all public routes
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Only protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
        const token = request.cookies.get("token")?.value;

        // If no token, redirect to signin
        if (!token) {
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }

        try {
            const decoded = verifyJWT(token, process.env.JWT_SECRET);
            const role = decoded.role;

            // Handle root dashboard redirect
            if (pathname === "/dashboard") {
                switch (role) {
                    case "GUEST":
                        return NextResponse.redirect(new URL("/dashboard/guest", request.url));
                    case "WARDEN":
                        return NextResponse.redirect(new URL("/dashboard/warden", request.url));
                    case "ADMIN":
                        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
                    case "USER":
                        return NextResponse.redirect(new URL("/", request.url));
                    default:
                        return NextResponse.redirect(new URL("/dashboard/guest", request.url));
                }
            }

            // Check if user has access to the specific dashboard route
            const hasAccess = (
                (role === "GUEST" && pathname.startsWith("/dashboard/guest")) ||
                (role === "WARDEN" && pathname.startsWith("/dashboard/warden")) ||
                (role === "ADMIN" && pathname.startsWith("/dashboard/admin"))
            );

            if (!hasAccess) {
                // Redirect to appropriate dashboard based on role
                switch (role) {
                    case "GUEST":
                        return NextResponse.redirect(new URL("/dashboard/guest", request.url));
                    case "WARDEN":
                        return NextResponse.redirect(new URL("/dashboard/warden", request.url));
                    case "ADMIN":
                        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
                    default:
                        return NextResponse.redirect(new URL("/dashboard/guest", request.url));
                }
            }

            return NextResponse.next();

        } catch (error) {
            console.error("JWT verification failed:", error);
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }
    }

    // For all other routes, allow access
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
    ],
};