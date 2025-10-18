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
    
    const isPublicRoute = pathname.startsWith("/api/auth") || 
                         pathname.startsWith("/auth") || 
                         pathname === "/" ||
                         pathname.startsWith("/_next") ||
                         pathname.startsWith("/static");
    
    const isDashboardRoute = pathname.startsWith("/dashboard");
    
    if (isPublicRoute) {
        return NextResponse.next();
    }
    
    if (isDashboardRoute) {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }
        
        try {
            const decoded = verifyJWT(token, process.env.JWT_SECRET);
            const role = decoded.role;
            const roleRoutes = {
                "GUEST": ["/dashboard/guest"],
                "WARDEN": ["/dashboard/warden"],
                "ADMIN": ["/dashboard/admin"],
                "USER": ["/dashboard/guest"]
            };
            
            if (pathname === "/dashboard") {
                if (role === "GUEST") {
                    return NextResponse.redirect(new URL("/dashboard/guest", request.url));
                }
                else if (role === "WARDEN") {
                    return NextResponse.redirect(new URL("/dashboard/warden", request.url));
                }
                else if (role === "ADMIN") {
                    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
                }
                else if (role === "USER") {
                    return NextResponse.redirect(new URL("/dashboard/user", request.url));
                }
            }
            
            const allowedRoutes = roleRoutes[role] || [];
            const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));
            
            if (!isAllowedRoute) {
                if (role === "GUEST") {
                    return NextResponse.redirect(new URL("/dashboard/guest", request.url));
                }
                else if (role === "WARDEN") {
                    return NextResponse.redirect(new URL("/dashboard/warden", request.url));
                }
                else if (role === "ADMIN") {
                    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
                }
                else if (role === "USER") {
                    return NextResponse.redirect(new URL("/dashboard/user", request.url));
                }
                else {
                    return NextResponse.redirect(new URL("/auth/signin", request.url));
                }
            }
            
            return NextResponse.next();
            
        } catch (error) {
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};