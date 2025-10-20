// code writeen by abdulllah with love  chaudaryabdullah899@gmail.com

import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session || !session.user || !session.user.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureConnection();

    let whereClause: any = {};

    if (session.user.role === "WARDEN") {
      // Warden can only see stats for their managed hostels
      const wardenHostels = await prisma.warden.findMany({
        where: { userId: session.user.id },
        select: { hostelId: true },
      });

      // here we get all the comaplain that whose warden == session.user.id and we filter the complaint  by particular hostel

      const hostelIds = wardenHostels
        .map((w: any) => w.hostelId)
        .filter(Boolean);
      whereClause.hostelId = { in: hostelIds };
    } else if (session.user.role === "GUEST") {
      // Guest can only see their own complaint stats
      whereClause.reportedBy = session.user.id;
    }

    // Get total complaints
    const totalComplaints = await prisma.complaint.count({
      where: whereClause,
    });

    // Get status breakdown
    const statusBreakdown = await prisma.complaint.groupBy({
      by: ["status"],
      where: whereClause,
      _count: {
        status: true,
      },
    });

    // Get priority breakdown
    const priorityBreakdown = await prisma.complaint.groupBy({
      by: ["priority"],
      where: whereClause,
      _count: {
        priority: true,
      },
    });

    // Get category breakdown
    const categoryBreakdown = await prisma.complaint.groupBy({
      by: ["category"],
      where: whereClause,
      _count: {
        category: true,
      },
    });

    // Get recent complaints (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentComplaints = await prisma.complaint.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const resolvedComplaints = await prisma.complaint.count({
      where: {
        ...whereClause,
        status: "RESOLVED",
        resolvedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get average resolution time (in days)
    const resolvedComplaintsWithTimes = await prisma.complaint.findMany({
      where: {
        ...whereClause,
        status: "RESOLVED",
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    const avgResolutionTime =
      resolvedComplaintsWithTimes.length > 0
        ? resolvedComplaintsWithTimes.reduce((sum: number, complaint: any) => {
            const resolutionTime =
              complaint.resolvedAt!.getTime() - complaint.createdAt.getTime();
            return sum + resolutionTime / (1000 * 60 * 60 * 24); // Convert to days
          }, 0) / resolvedComplaintsWithTimes.length
        : 0;

    const stats = {
      summary: {
        totalComplaints,
        recentComplaints,
        resolvedComplaints,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, // Round to 1 decimal place
      },
      statusBreakdown: statusBreakdown.map((item: any) => ({
        status: item.status,
        count: item._count.status,
      })),
      priorityBreakdown: priorityBreakdown.map((item: any) => ({
        priority: item.priority,
        count: item._count.priority,
      })),
      categoryBreakdown: categoryBreakdown.map((item: any) => ({
        category: item.category,
        count: item._count.category,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching complaint stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaint stats" },
      { status: 500 },
    );
  }
}
