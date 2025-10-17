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

        // Get current date for today's data
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        // Get current month data
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        // 1. ROOM STATISTICS
        const totalRooms = await prisma.room.count({
            where: hostelFilter
        });

        const occupiedRooms = await prisma.room.count({
            where: {
                ...hostelFilter,
                status: "OCCUPIED"
            }
        });

        const availableRooms = await prisma.room.count({
            where: {
                ...hostelFilter,
                status: "AVAILABLE"
            }
        });

        const maintenanceRooms = await prisma.room.count({
            where: {
                ...hostelFilter,
                status: "MAINTENANCE"
            }
        });

        // 2. USER STATISTICS
        const totalUsers = await prisma.user.count();
        const totalGuests = await prisma.user.count({
            where: { role: "GUEST" }
        });
        const totalStaff = await prisma.user.count({
            where: { 
                role: { 
                    in: ["STAFF", "WARDEN", "ADMIN"] 
                } 
            }
        });

        // 3. BOOKING STATISTICS
        const totalBookings = await prisma.booking.count({
            where: {
                ...dateFilter,
                ...hostelFilter
            }
        });

        const activeBookings = await prisma.booking.count({
            where: {
                status: "CHECKED_IN",
                ...hostelFilter
            }
        });

        const pendingBookings = await prisma.booking.count({
            where: {
                status: "PENDING",
                ...hostelFilter
            }
        });

        const todayCheckIns = await prisma.booking.count({
            where: {
                checkin: {
                    gte: startOfToday,
                    lte: endOfToday
                },
                ...hostelFilter
            }
        });

        const todayCheckOuts = await prisma.booking.count({
            where: {
                checkout: {
                    gte: startOfToday,
                    lte: endOfToday
                },
                ...hostelFilter
            }
        });

        // 4. PAYMENT STATISTICS
        const totalPayments = await prisma.payment.count({
            where: {
                ...dateFilter,
                ...hostelFilter
            }
        });

        const completedPayments = await prisma.payment.count({
            where: {
                status: "COMPLETED",
                ...dateFilter,
                ...hostelFilter
            }
        });

        const pendingPayments = await prisma.payment.count({
            where: {
                status: "PENDING",
                ...dateFilter,
                ...hostelFilter
            }
        });

        const totalRevenue = await prisma.payment.aggregate({
            where: {
                status: "COMPLETED",
                ...dateFilter,
                ...hostelFilter
            },
            _sum: {
                amount: true
            }
        });

        const monthlyRevenue = await prisma.payment.aggregate({
            where: {
                status: "COMPLETED",
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                ...hostelFilter
            },
            _sum: {
                amount: true
            }
        });

        // 5. MAINTENANCE STATISTICS
        const totalMaintenanceRequests = await prisma.maintenance.count({
            where: {
                ...dateFilter,
                ...hostelFilter
            }
        });

        const pendingMaintenanceRequests = await prisma.maintenance.count({
            where: {
                status: "PENDING",
                ...hostelFilter
            }
        });

        const inProgressMaintenanceRequests = await prisma.maintenance.count({
            where: {
                status: "IN_PROGRESS",
                ...hostelFilter
            }
        });

        const completedMaintenanceRequests = await prisma.maintenance.count({
            where: {
                status: "COMPLETED",
                ...dateFilter,
                ...hostelFilter
            }
        });

        // 6. EXPENSE STATISTICS
        const totalExpenses = await prisma.expense.count({
            where: {
                ...dateFilter,
                ...hostelFilter
            }
        });

        const totalExpenseAmount = await prisma.expense.aggregate({
            where: {
                status: "APPROVED",
                ...dateFilter,
                ...hostelFilter
            },
            _sum: {
                amount: true
            }
        });

        // 7. RECENT ACTIVITIES
        const recentBookings = await prisma.booking.findMany({
            where: {
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
                        roomNumber: true,
                        floor: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        const recentPayments = await prisma.payment.findMany({
            where: {
                ...hostelFilter
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        const recentMaintenance = await prisma.maintenance.findMany({
            where: {
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
                reportedAt: 'desc'
            },
            take: 10
        });

        // 8. OCCUPANCY RATE CALCULATION
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // 9. REVENUE TRENDS (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenueData = await prisma.payment.groupBy({
            by: ['createdAt'],
            where: {
                status: "COMPLETED",
                createdAt: {
                    gte: sixMonthsAgo
                },
                ...hostelFilter
            },
            _sum: {
                amount: true
            },
            _count: {
                id: true
            }
        });

        // 10. BOOKING STATUS DISTRIBUTION
        const bookingStatusDistribution = await prisma.booking.groupBy({
            by: ['status'],
            where: {
                ...hostelFilter
            },
            _count: {
                status: true
            }
        });

        // 11. PAYMENT METHOD DISTRIBUTION
        const paymentMethodDistribution = await prisma.payment.groupBy({
            by: ['method'],
            where: {
                status: "COMPLETED",
                ...dateFilter,
                ...hostelFilter
            },
            _count: {
                method: true
            },
            _sum: {
                amount: true
            }
        });

        // 12. TOP PERFORMING ROOMS
        const topPerformingRooms = await prisma.room.findMany({
            where: {
                ...hostelFilter
            },
            include: {
                bookings: {
                    where: {
                        status: "COMPLETED",
                        ...dateFilter
                    },
                    include: {
                        payment: {
                            where: {
                                status: "COMPLETED"
                            }
                        }
                    }
                }
            },
                take: 10
        });

        const roomsWithRevenue = topPerformingRooms.map((room: any) => ({
            roomNumber: room.roomNumber,
            floor: room.floor,
            totalRevenue: room.bookings.reduce((sum: number, booking: any) => 
                sum + (booking.payment?.amount || 0), 0
            ),
            bookingCount: room.bookings.length
        })).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

        return NextResponse.json({
            summary: {
                // Room stats
                totalRooms,
                occupiedRooms,
                availableRooms,
                maintenanceRooms,
                occupancyRate,
                
                // User stats
                totalUsers,
                totalGuests,
                totalStaff,
                
                // Booking stats
                totalBookings,
                activeBookings,
                pendingBookings,
                todayCheckIns,
                todayCheckOuts,
                
                // Payment stats
                totalPayments,
                completedPayments,
                pendingPayments,
                totalRevenue: totalRevenue._sum.amount || 0,
                monthlyRevenue: monthlyRevenue._sum.amount || 0,
                
                // Maintenance stats
                totalMaintenanceRequests,
                pendingMaintenanceRequests,
                inProgressMaintenanceRequests,
                completedMaintenanceRequests,
                
                // Expense stats
                totalExpenses,
                totalExpenseAmount: totalExpenseAmount._sum.amount || 0
            },
            
            // Distribution data
            bookingStatusDistribution: bookingStatusDistribution.map((item: any) => ({
                status: item.status,
                count: item._count.status
            })),
            
            paymentMethodDistribution: paymentMethodDistribution.map((item: any) => ({
                method: item.method,
                count: item._count.method,
                amount: item._sum.amount || 0
            })),
            
            // Recent activities
            recentActivities: {
                bookings: recentBookings.map((booking: any) => ({
                    id: booking.id,
                    type: 'booking',
                    message: `New booking for Room ${booking.room?.roomNumber || 'N/A'}`,
                    user: booking.user,
                    timestamp: booking.createdAt,
                    status: booking.status
                })),
                payments: recentPayments.map((payment: any) => ({
                    id: payment.id,
                    type: 'payment',
                    message: `Payment of PKR ${payment.amount} received`,
                    user: payment.user,
                    timestamp: payment.createdAt,
                    status: payment.status
                })),
                maintenance: recentMaintenance.map((maintenance: any) => ({
                    id: maintenance.id,
                    type: 'maintenance',
                    message: `Maintenance request for Room ${maintenance.room?.roomNumber || 'N/A'}`,
                    user: maintenance.user,
                    timestamp: maintenance.reportedAt,
                    status: maintenance.status
                }))
            },
            
            // Analytics data
            topPerformingRooms: roomsWithRevenue,
            monthlyRevenueData: monthlyRevenueData.map((item: any) => ({
                month: item.createdAt.toISOString().substring(0, 7),
                revenue: item._sum.amount || 0,
                count: item._count.id
            }))
        });

    } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard statistics" },
            { status: 500 }
        );
    }
}
