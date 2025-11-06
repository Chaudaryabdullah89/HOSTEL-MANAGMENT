import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (error: any) {
            console.error("Error creating uploads directory:", error);
            // If directory creation fails, try to continue anyway
            if (error.code !== 'EEXIST') {
                throw new Error(`Failed to create uploads directory: ${error.message}`);
            }
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const filename = `${timestamp}_${randomString}.${fileExtension}`;
        const filepath = join(uploadsDir, filename);

        // Write file to disk
        try {
            await writeFile(filepath, buffer);
        } catch (error: any) {
            console.error("Error writing file:", error);
            // On Vercel/serverless, filesystem might be read-only
            // Return a base64 data URL as fallback
            const base64 = Buffer.from(buffer).toString('base64');
            const dataUrl = `data:${file.type};base64,${base64}`;
            
            return NextResponse.json({
                success: true,
                url: dataUrl,
                filename: filename,
                warning: "File saved as data URL (filesystem not writable)",
            });
        }

        // Return the public URL
        const publicUrl = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: filename,
        });
    } catch (error: any) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { 
                error: error.message || "Failed to upload file",
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}





