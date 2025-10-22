import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();

        // Clear the token cookie by setting it to expire
        cookieStore.set({
            name: "token",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
            maxAge: 0, // This will expire the cookie immediately
        });

        return NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Signout error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Handle GET requests by redirecting to signin
    return NextResponse.redirect(new URL("/auth/signin", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
