import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const hostelId = searchParams.get('hostelId');
        const submittedBy = searchParams.get('submittedBy');
        const search = searchParams.get('search');

        const whereClause: any = {};

        if (status) {
            whereClause.status = status;
        }
        if (category) {
            whereClause.category = category;
        }
        if (hostelId) {
            whereClause.hostelId = hostelId;
        }
        if (submittedBy) {
            whereClause.submittedBy = submittedBy;
        }
        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const expenses = await prisma.expense.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true
                    }
                },
                approver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json(
            { error: "Failed to fetch expenses" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            amount,
            category,
            hostelId,
            receiptUrl,
            notes
        } = body;

        if (!title || !description || !amount || !category || !hostelId) {
            return NextResponse.json(
                { error: "Title, description, amount, category, and hostel ID are required" },
                { status: 400 }
            );
        }

        // Validate that the hostel exists
        const hostel = await prisma.hostel.findUnique({
            where: { id: hostelId }
        });

        if (!hostel) {
            return NextResponse.json(
                { error: "Invalid hostel ID. Please select a valid hostel." },
                { status: 400 }
            );
        }

        const expense = await prisma.expense.create({
            data: {
                title,
                description,
                amount,
                category,
                submittedBy: session.user.id,
                hostelId,
                receiptUrl: receiptUrl || null,
                notes: notes || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                }
            }
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        console.error("Error creating expense:", error);
        return NextResponse.json(
            { error: "Failed to create expense" },
            { status: 500 }
        );
    }
}
