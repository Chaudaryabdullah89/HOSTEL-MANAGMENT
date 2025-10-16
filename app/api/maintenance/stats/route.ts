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
            whereClause.reportedAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const totalRequests = await prisma.maintenance.count({
            where: whereClause
        });

        const statusCounts = await prisma.maintenance.groupBy({
            by: ['status'],
            where: whereClause,
            _count: {
                id: true
            }
        });

        const priorityCounts = await prisma.maintenance.groupBy({
            by: ['priority'],
            where: whereClause,
            _count: {
                id: true
            }
        });

        // Get recent requests (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentRequests = await prisma.maintenance.count({
            where: {
                ...whereClause,
                reportedAt: {
                    gte: sevenDaysAgo
                }
            }
        });

        // Get average resolution time
        const completedRequests = await prisma.maintenance.findMany({
            where: {
                ...whereClause,
                status: "COMPLETED",
                completedAt: { not: null }
            },
            select: {
                reportedAt: true,
                completedAt: true
            }
        });

        const avgResolutionTime = completedRequests.length > 0 
            ? completedRequests.reduce((sum: number, req: any) => {
                const diff = req.completedAt!.getTime() - req.reportedAt.getTime();
                return sum + diff;
            }, 0) / completedRequests.length / (1000 * 60 * 60 * 24) // Convert to days
            : 0;

        // Get cost statistics
        const costStats = await prisma.maintenance.aggregate({
            where: {
                ...whereClause,
                actualCost: { not: null }
            },
            _sum: {
                actualCost: true
            },
            _avg: {
                actualCost: true
            },
            _count: {
                actualCost: true
            }
        });

        // Get most common issues
        const commonIssues = await prisma.maintenance.groupBy({
            by: ['title'],
            where: whereClause,
            _count: {
                title: true
            },
            orderBy: {
                _count: {
                    title: 'desc'
                }
            },
            take: 5
        });

        const response = NextResponse.json({
            summary: {
                totalRequests,
                recentRequests,
                avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, // Round to 1 decimal
                totalCost: costStats._sum.actualCost || 0,
                avgCost: costStats._avg.actualCost || 0,
                costCount: costStats._count.actualCost || 0
            },
            statusBreakdown: statusCounts.map((item: any) => ({
                status: item.status,
                count: item._count.id
            })),
            priorityBreakdown: priorityCounts.map((item: any) => ({
                priority: item.priority,
                count: item._count.id
            })),
            commonIssues: commonIssues.map((item: any) => ({
                title: item.title,
                count: item._count.title
            }))
        });
        
        // Add cache headers for stats (can be cached longer)
        response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5 min cache, 10 min stale
        response.headers.set('ETag', `"maintenance-stats-${Date.now()}"`);
        
        return response;
    } catch (error) {
        console.error("Error fetching maintenance statistics:", error);
        return NextResponse.json(
            { error: "Failed to fetch maintenance statistics" },
            { status: 500 }
        );
    }
}
