import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "@/lib/server-auth";

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
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ 
                error: "Invalid file type. Only images (JPEG, PNG, GIF) and PDF files are allowed." 
            }, { status: 400 });
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({ 
                error: "File too large. Maximum size is 10MB." 
            }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `receipt_${timestamp}_${randomString}.${fileExtension}`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts');
        await mkdir(uploadsDir, { recursive: true });

        // Save file
        const filePath = join(uploadsDir, fileName);
        await writeFile(filePath, buffer);

        // Return the public URL
        const publicUrl = `/uploads/receipts/${fileName}`;

        return NextResponse.json({
            success: true,
            fileName,
            filePath: publicUrl,
            originalName: file.name,
            size: file.size,
            type: file.type
        });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" }, 
            { status: 500 }
        );
    }
}
