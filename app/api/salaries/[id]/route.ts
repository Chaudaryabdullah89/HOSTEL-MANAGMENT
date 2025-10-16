import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

// Get single salary
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const salaryId = params.id;

        const salary = await prisma.salary.findUnique({
            where: { id: salaryId },
            include: {
                staff: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        position: true,
                        department: true,
                        hostel: {
                            select: {
                                hostelName: true
                            }
                        }
                    }
                }
            }
        });

        if (!salary) {
            return NextResponse.json(
                { error: "Salary not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(salary);
    } catch (error) {
        console.error("Error fetching salary:", error);
        return NextResponse.json(
            { error: "Failed to fetch salary" },
            { status: 500 }
        );
    }
}

// Update salary
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const salaryId = params.id;
        const body = await request.json();
        const {
            amount,
            status,
            overtimeAmount,
            bonusAmount,
            deductions,
            netAmount,
            notes
        } = body;

        // Check if salary exists
        const existingSalary = await prisma.salary.findUnique({
            where: { id: salaryId }
        });

        if (!existingSalary) {
            return NextResponse.json(
                { error: "Salary not found" },
                { status: 404 }
            );
        }

        // Update salary
        const updatedSalary = await prisma.salary.update({
            where: { id: salaryId },
            data: {
                ...(amount !== undefined && { amount }),
                ...(status !== undefined && { status }),
                ...(overtimeAmount !== undefined && { overtimeAmount }),
                ...(bonusAmount !== undefined && { bonusAmount }),
                ...(deductions !== undefined && { deductions }),
                ...(netAmount !== undefined && { netAmount }),
                ...(notes !== undefined && { notes }),
                processedBy: session.user.id,
                processedAt: new Date()
            },
            include: {
                staff: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        position: true,
                        department: true,
                        hostel: {
                            select: {
                                hostelName: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(updatedSalary);
    } catch (error) {
        console.error("Error updating salary:", error);
        return NextResponse.json(
            { error: "Failed to update salary" },
            { status: 500 }
        );
    }
}

// Delete salary
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const salaryId = params.id;

        // Check if salary exists
        const existingSalary = await prisma.salary.findUnique({
            where: { id: salaryId }
        });

        if (!existingSalary) {
            return NextResponse.json(
                { error: "Salary not found" },
                { status: 404 }
            );
        }

        // Only allow deletion of PENDING salaries
        if (existingSalary.status !== "PENDING") {
            return NextResponse.json(
                { error: "Cannot delete non-pending salaries" },
                { status: 400 }
            );
        }

        await prisma.salary.delete({
            where: { id: salaryId }
        });

        return NextResponse.json(
            { message: "Salary deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting salary:", error);
        return NextResponse.json(
            { error: "Failed to delete salary" },
            { status: 500 }
        );
    }
}
