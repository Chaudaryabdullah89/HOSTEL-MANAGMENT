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
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const hostelId = searchParams.get('hostelId');

        // Build date filter
        const dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        // Build hostel filter
        const hostelFilter = hostelId ? { hostelId } : {};

        // Get total users count
        const totalUsers = await prisma.user.count();

        // Get guests count
        const guestsCount = await prisma.user.count({
            where: { role: "GUEST" }
        });

        // Get staff count (including wardens and admins)
        const staffCount = await prisma.user.count({
            where: { 
                role: { 
                    in: ["STAFF", "WARDEN", "ADMIN"] 
                } 
            }
        });

        // Get active guests (currently checked in)
        const activeGuests = await prisma.booking.count({
            where: {
                status: "CHECKED_IN",
                ...hostelFilter
            }
        });

        // Get total bookings count
        const totalBookings = await prisma.booking.count({
            where: {
                ...dateFilter,
                ...hostelFilter
            }
        });

        // Get booking status distribution
        const bookingStatusDistribution = await prisma.booking.groupBy({
            by: ['status'],
            where: {
                ...dateFilter,
                ...hostelFilter
            },
            _count: {
                status: true
            }
        });

        // Get top performing rooms (by revenue)
        const topRooms = await prisma.room.findMany({
            where: hostelFilter,
            include: {
                bookings: {
                    where: {
                        ...dateFilter,
                        status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
                    },
                    include: {
                        payment: true
                    }
                }
            },
            take: 5
        });

        // Calculate revenue for each room
        const roomsWithRevenue = topRooms.map((room: any) => {
            const totalRevenue = room.bookings.reduce((sum: number, booking: any) => {
                return sum + (booking.payment?.amount || 0);
            }, 0);
            return {
                id: room.id,
                roomNumber: room.roomNumber,
                floor: room.floor,
                type: room.type,
                status: room.status,
                revenue: totalRevenue,
                bookingCount: room.bookings.length
            };
        }).sort((a: any, b: any) => b.revenue - a.revenue);

        // Get occupancy rate
        const totalRooms = await prisma.room.count({
            where: hostelFilter
        });
        const occupiedRooms = await prisma.room.count({
            where: {
                ...hostelFilter,
                status: "OCCUPIED"
            }
        });
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // Get recent bookings
        const recentBookings = await prisma.booking.findMany({
            where: {
                ...dateFilter,
                ...hostelFilter
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                room: {
                    select: {
                        roomNumber: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        });

        // Get revenue data
        const totalRevenue = await prisma.payment.aggregate({
            where: {
                ...dateFilter,
                booking: {
                    ...hostelFilter
                },
                status: "COMPLETED"
            },
            _sum: {
                amount: true
            }
        });

        // Get monthly revenue trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyRevenue = await prisma.payment.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: sixMonthsAgo
                },
                booking: {
                    ...hostelFilter
                },
                status: "COMPLETED"
            },
            _sum: {
                amount: true
            },
            _count: {
                amount: true
            }
        });

        // Format monthly revenue data
        const monthlyRevenueData = monthlyRevenue.map((item: any) => ({
            month: item.createdAt.toISOString().slice(0, 7), // YYYY-MM format
            revenue: item._sum.amount || 0,
            count: item._count.amount || 0
        }));

        return NextResponse.json({
            summary: {
                totalUsers,
                guestsCount,
                staffCount,
                activeGuests,
                totalBookings,
                totalRevenue: totalRevenue._sum.amount || 0,
                occupancyRate,
                totalRooms,
                occupiedRooms
            },
            bookingStatusDistribution: bookingStatusDistribution.map((item: any) => ({
                status: item.status,
                count: item._count.status
            })),
            topPerformingRooms: roomsWithRevenue,
            recentBookings: recentBookings.map((booking: any) => ({
                id: booking.id,
                userName: booking.user?.name || 'Unknown',
                userEmail: booking.user?.email || '',
                roomNumber: booking.room?.roomNumber || 'N/A',
                checkIn: booking.checkin,
                status: booking.status,
                createdAt: booking.createdAt
            })),
            monthlyRevenue: monthlyRevenueData
        });

    } catch (error) {
        console.error("Error fetching dashboard reports:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard reports" },
            { status: 500 }
        );
    }
}
