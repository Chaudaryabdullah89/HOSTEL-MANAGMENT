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
        const hostelId = searchParams.get('hostelId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const whereClause: any = {};
        if (hostelId) {
            whereClause.hostelId = hostelId;
        }
        if (startDate && endDate) {
            whereClause.submittedAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        // Get total counts
        const totalExpenses = await prisma.expense.count({
            where: whereClause
        });

        const statusCounts = await prisma.expense.groupBy({
            by: ['status'],
            where: whereClause,
            _count: {
                id: true
            }
        });

        const categoryCounts = await prisma.expense.groupBy({
            by: ['category'],
            where: whereClause,
            _count: {
                id: true
            }
        });

        // Get recent expenses (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentExpenses = await prisma.expense.count({
            where: {
                ...whereClause,
                submittedAt: {
                    gte: sevenDaysAgo
                }
            }
        });

        // Get total amount by status
        const amountStats = await prisma.expense.groupBy({
            by: ['status'],
            where: whereClause,
            _sum: {
                amount: true
            }
        });

        // Get total amount
        const totalAmount = await prisma.expense.aggregate({
            where: whereClause,
            _sum: {
                amount: true
            }
        });

        // Get average amount
        const avgAmount = await prisma.expense.aggregate({
            where: whereClause,
            _avg: {
                amount: true
            }
        });

        // Get top categories by amount
        const topCategories = await prisma.expense.groupBy({
            by: ['category'],
            where: whereClause,
            _sum: {
                amount: true
            },
            _count: {
                id: true
            },
            orderBy: {
                _sum: {
                    amount: 'desc'
                }
            },
            take: 5
        });

        return NextResponse.json({
            summary: {
                totalExpenses,
                recentExpenses,
                totalAmount: totalAmount._sum.amount || 0,
                avgAmount: avgAmount._avg.amount || 0
            },
            statusBreakdown: statusCounts.map((item: any) => ({
                status: item.status,
                count: item._count.id,
                amount: amountStats.find((s: any) => s.status === item.status)?._sum.amount || 0
            })),
            categoryBreakdown: categoryCounts.map((item: any) => ({
                category: item.category,
                count: item._count.id
            })),
            topCategories: topCategories.map((item: any) => ({
                category: item.category,
                amount: item._sum.amount || 0,
                count: item._count.id
            }))
        });
    } catch (error) {
        console.error("Error fetching expense statistics:", error);
        return NextResponse.json(
            { error: "Failed to fetch expense statistics" },
            { status: 500 }
        );
    }
}
