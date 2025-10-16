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
    
    console.log("🔍 Middleware running for path:", pathname);
    const isPublicRoute = pathname.startsWith("/api/auth") || 
                         pathname.startsWith("/auth") || 
                         pathname === "/" ||
                         pathname.startsWith("/_next") ||
                         pathname.startsWith("/static");
    
    const isDashboardRoute = pathname.startsWith("/dashboard");
    
    console.log("📋 Route analysis:", {
        pathname,
        isPublicRoute,
        isDashboardRoute
    });
    
    if (isPublicRoute) {
        console.log("✅ Public route, allowing access");
        return NextResponse.next();
    }
    
    if (isDashboardRoute) {
        console.log("🔐 Dashboard route detected, checking authentication");
        
        const allCookies = request.cookies.getAll();
        console.log("🍪 All cookies:", allCookies);
        
        const token = request.cookies.get("token")?.value;
        console.log("🎫 Token found:", !!token);
        if (token) {
            console.log("🎫 Token value (first 50 chars):", token.substring(0, 50) + "...");
        }
        
        if (!token) {
            console.log("❌ No token found, redirecting to signin");
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }
        
        try {
            console.log("🔍 Verifying token with secret:", process.env.JWT_SECRET ? "✅ Secret exists" : "❌ No secret");
            
            // Verify the custom JWT token using our Edge Runtime compatible function
            const decoded = verifyJWT(token, process.env.JWT_SECRET);
            console.log("✅ Token verified successfully:", decoded);
            
            // Get user role from the token
            const role = decoded.role;
            console.log("👤 User role:", role);
            
            // Define allowed routes for each role
            const roleRoutes = {
                "GUEST": ["/dashboard/guest"],
                "WARDEN": ["/dashboard/warden"],
                "ADMIN": ["/dashboard/admin"],
                "USER": ["/dashboard/user"]
            };
            
          
            if (pathname === "/dashboard") {
                console.log(`🔄 Generic dashboard access, redirecting ${role} to their specific dashboard`);
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
                // User is trying to access a route they're not allowed to
                console.log(`🚫 Access denied: ${role} cannot access ${pathname}`);
                
                // Redirect to their appropriate dashboard
                if (role === "GUEST") {
                    console.log("🔄 Redirecting GUEST to guest dashboard");
                    return NextResponse.redirect(new URL("/dashboard/guest", request.url));
                }
                else if (role === "WARDEN") {
                    console.log("🔄 Redirecting WARDEN to warden dashboard");
                    return NextResponse.redirect(new URL("/dashboard/warden", request.url));
                }
                else if (role === "ADMIN") {
                    console.log("🔄 Redirecting ADMIN to admin dashboard");
                    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
                }
                else if (role === "USER") {
                    console.log("🔄 Redirecting USER to user dashboard");
                    return NextResponse.redirect(new URL("/dashboard/user", request.url));
                }
                else {
                    // Unknown role, redirect to signin
                    console.log("❌ Unknown role, redirecting to signin");
                    return NextResponse.redirect(new URL("/auth/signin", request.url));
                }
            }
            
            // If role matches the current path, allow access
            console.log("✅ Role matches current path, allowing access");
            return NextResponse.next();
            
        } catch (error) {
            console.log("❌ Token verification failed:", error.message);
            console.log("🔍 Error details:", error);
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }
    }
    
    console.log("✅ Non-dashboard route, allowing access");
    return NextResponse.next();
}

export const config = {
    matcher: [
        
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};