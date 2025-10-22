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

        // Get all data in parallel for better performance
        const [
            dashboardStats,
            financialData,
            salaryData,
            maintenanceData,
            expenseData,
            detailedBookings,
            detailedPayments,
            detailedRooms,
            detailedUsers
        ] = await Promise.all([
            getDashboardStats(dateFilter, hostelFilter),
            getFinancialData(dateFilter, hostelFilter),
            getSalaryData(dateFilter),
            getMaintenanceData(dateFilter, hostelFilter),
            getExpenseData(dateFilter, hostelFilter),
            getDetailedBookings(dateFilter, hostelFilter),
            getDetailedPayments(dateFilter, hostelFilter),
            getDetailedRooms(hostelFilter),
            getDetailedUsers()
        ]);

        return NextResponse.json({
            summary: {
                ...dashboardStats.summary,
                ...financialData.summary,
                netProfit: financialData.summary.totalRevenue - financialData.summary.totalExpenses,
                profitMargin: financialData.summary.totalRevenue > 0
                    ? ((financialData.summary.totalRevenue - financialData.summary.totalExpenses) / financialData.summary.totalRevenue * 100).toFixed(2)
                    : 0
            },
            financial: financialData,
            salary: salaryData,
            maintenance: maintenanceData,
            expenses: expenseData,
            bookings: detailedBookings,
            payments: detailedPayments,
            rooms: detailedRooms,
            users: detailedUsers,
            dashboard: dashboardStats,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error fetching comprehensive reports:", error);
        return NextResponse.json(
            { error: "Failed to fetch comprehensive reports" },
            { status: 500 }
        );
    }
}

export async function getDashboardStats(dateFilter: any, hostelFilter: any) {
    // Get total users count
    const totalUsers = await prisma.user.count();
    const guestsCount = await prisma.user.count({
        where: { role: "GUEST" }
    });
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

    return {
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
        }
    };
}

export async function getFinancialData(dateFilter: any, hostelFilter: any) {
    // Get booking payments
    const bookingPayments = await prisma.payment.aggregate({
        where: {
            ...dateFilter,
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

    // Get salary payments
    const salaryPayments = await prisma.salary.aggregate({
        where: {
            ...dateFilter,
            status: "PAID"
        },
        _sum: {
            netAmount: true
        },
        _count: {
            netAmount: true
        }
    });

    // Get pending payments
    const pendingPayments = await prisma.payment.aggregate({
        where: {
            ...dateFilter,
            booking: {
                ...hostelFilter
            },
            status: "PENDING"
        },
        _sum: {
            amount: true
        },
        _count: {
            amount: true
        }
    });

    // Get revenue by payment method
    const revenueByMethod = await prisma.payment.groupBy({
        by: ['method'],
        where: {
            ...dateFilter,
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

    // Get revenue by room type
    const revenueByRoomType = await prisma.payment.findMany({
        where: {
            ...dateFilter,
            booking: {
                ...hostelFilter
            },
            status: "COMPLETED"
        },
        include: {
            booking: {
                include: {
                    room: {
                        select: {
                            type: true
                        }
                    }
                }
            }
        }
    });

    // Group by room type
    const roomTypeRevenue = revenueByRoomType.reduce((acc: any, payment: any) => {
        const roomType = payment.booking?.room?.type || 'Unknown';
        if (!acc[roomType]) {
            acc[roomType] = { amount: 0, count: 0 };
        }
        acc[roomType].amount += payment.amount;
        acc[roomType].count += 1;
        return acc;
    }, {});

    const totalRevenue = bookingPayments._sum.amount || 0;
    const totalExpenses = salaryPayments._sum.netAmount || 0;
    const pendingRevenue = pendingPayments._sum.amount || 0;

    return {
        summary: {
            totalRevenue,
            totalExpenses,
            pendingRevenue,
            bookingCount: bookingPayments._count.amount || 0,
            salaryCount: salaryPayments._count.netAmount || 0,
            pendingCount: pendingPayments._count.amount || 0
        },
        revenueByMethod: revenueByMethod.map((item: any) => ({
            method: item.method,
            amount: item._sum.amount || 0,
            count: item._count.amount || 0
        })),
        revenueByRoomType: Object.entries(roomTypeRevenue).map(([type, data]: [string, any]) => ({
            roomType: type,
            amount: data.amount,
            count: data.count
        }))
    };
}

export async function getSalaryData(dateFilter: any) {
    const salaries = await prisma.salary.findMany({
        where: dateFilter,
        include: {
            staff: {
                select: {
                    id: true,
                    name: true,
                    position: true,
                    department: true
                }
            }
        }
    });

    const totalPaid = salaries
        .filter((s: any) => s.status === 'PAID')
        .reduce((sum: number, s: any) => sum + s.netAmount, 0);

    const totalPending = salaries
        .filter((s: any) => s.status === 'PENDING')
        .reduce((sum: number, s: any) => sum + s.netAmount, 0);

    const statusBreakdown = salaries.reduce((acc: Record<string, number>, salary: any) => {
        acc[salary.status] = (acc[salary.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const uniqueStaff = new Set(salaries.map((s: any) => s.staffId)).size;
    const averageSalary = salaries.length > 0 ? salaries.reduce((sum: number, s: any) => sum + s.netAmount, 0) / salaries.length : 0;

    return {
        summary: {
            totalPaid,
            totalPending,
            averageSalary,
            totalStaff: uniqueStaff,
            statusBreakdown
        },
        details: salaries.map((salary: any) => ({
            id: salary.id,
            staffName: salary.staff.name,
            position: salary.staff.position,
            department: salary.staff.department,
            payDate: salary.payDate,
            baseAmount: salary.baseAmount,
            netAmount: salary.netAmount,
            status: salary.status
        }))
    };
}

export async function getMaintenanceData(dateFilter: any, hostelFilter: any) {
    const whereClause = {
        ...hostelFilter,
        ...(dateFilter.createdAt ? { reportedAt: dateFilter.createdAt } : {})
    };

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

    const maintenanceRequests = await prisma.maintenance.findMany({
        where: whereClause,
        include: {
            room: {
                select: {
                    roomNumber: true,
                    floor: true
                }
            },
            assignee: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            reportedAt: 'desc'
        }
    });

    return {
        summary: {
            totalRequests,
            statusBreakdown: statusCounts.map((item: any) => ({
                status: item.status,
                count: item._count.id
            })),
            priorityBreakdown: priorityCounts.map((item: any) => ({
                priority: item.priority,
                count: item._count.id
            }))
        },
        details: maintenanceRequests.map((req: any) => ({
            id: req.id,
            title: req.title,
            description: req.description,
            status: req.status,
            priority: req.priority,
            roomNumber: req.room?.roomNumber || 'N/A',
            floor: req.room?.floor || 'N/A',
            assignee: req.assignee?.name || 'Unassigned',
            reportedAt: req.reportedAt,
            createdAt: req.createdAt
        }))
    };
}

export async function getExpenseData(dateFilter: any, hostelFilter: any) {
    const whereClause = {
        ...hostelFilter,
        ...(dateFilter.createdAt ? { submittedAt: dateFilter.createdAt } : {})
    };

    const totalExpenses = await prisma.expense.count({
        where: whereClause
    });

    const amountStats = await prisma.expense.aggregate({
        where: whereClause,
        _sum: {
            amount: true
        },
        _avg: {
            amount: true
        }
    });

    const categoryCounts = await prisma.expense.groupBy({
        by: ['category'],
        where: whereClause,
        _sum: {
            amount: true
        },
        _count: {
            id: true
        }
    });

    const expenses = await prisma.expense.findMany({
        where: whereClause,
        include: {
            user: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            submittedAt: 'desc'
        }
    });

    return {
        summary: {
            totalExpenses,
            totalAmount: amountStats._sum.amount || 0,
            avgAmount: amountStats._avg.amount || 0
        },
        categoryBreakdown: categoryCounts.map((item: any) => ({
            category: item.category,
            amount: item._sum.amount || 0,
            count: item._count.id
        })),
        details: expenses.map((expense: any) => ({
            id: expense.id,
            title: expense.title,
            description: expense.description,
            category: expense.category,
            amount: expense.amount,
            status: expense.status,
            submittedBy: expense.user?.name || 'Unknown',
            submittedAt: expense.submittedAt,
            createdAt: expense.createdAt
        }))
    };
}

export async function getDetailedBookings(dateFilter: any, hostelFilter: any) {
    const bookings = await prisma.booking.findMany({
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
                    roomNumber: true,
                    floor: true,
                    type: true,
                    pricePerNight: true
                }
            },
            hostel: {
                select: {
                    hostelName: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return bookings.map((booking: any) => ({
        id: booking.id,
        guestName: booking.user?.name || 'Unknown',
        guestEmail: booking.user?.email || '',
        roomNumber: booking.room?.roomNumber || 'N/A',
        floor: booking.room?.floor || 'N/A',
        roomType: booking.room?.type || 'Unknown',
        hostelName: booking.hostel?.hostelName || 'Unknown',
        checkin: booking.checkin,
        checkout: booking.checkout,
        status: booking.status,
        price: booking.price,
        bookingType: booking.bookingType,
        createdAt: booking.createdAt
    }));
}

export async function getDetailedPayments(dateFilter: any, hostelFilter: any) {
    const payments = await prisma.payment.findMany({
        where: {
            ...dateFilter,
            booking: {
                ...hostelFilter
            }
        },
        include: {
            booking: {
                include: {
                    room: {
                        select: {
                            roomNumber: true
                        }
                    },
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return payments.map((payment: any) => ({
        id: payment.id,
        bookingId: payment.bookingId,
        guestName: payment.booking?.user?.name || 'Unknown',
        roomNumber: payment.booking?.room?.roomNumber || 'N/A',
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        description: payment.description,
        receiptUrl: payment.receiptUrl,
        createdAt: payment.createdAt
    }));
}

export async function getDetailedRooms(hostelFilter: any) {
    const rooms = await prisma.room.findMany({
        where: hostelFilter,
        include: {
            bookings: {
                where: {
                    status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
                },
                include: {
                    payments: true
                }
            }
        }
    });

    return rooms.map((room: any) => {
        const totalRevenue = room.bookings.reduce((sum: number, booking: any) => {
            return sum + (booking.payments?.reduce((pSum: number, pay: any) => pSum + (pay.amount || 0), 0) || 0);
        }, 0);

        return {
            id: room.id,
            roomNumber: room.roomNumber,
            floor: room.floor,
            type: room.type,
            status: room.status,
            pricePerNight: room.pricePerNight,
            pricePerMonth: room.pricePerMonth,
            totalRevenue,
            bookingCount: room.bookings.length,
            occupancyRate: room.status === 'OCCUPIED' ? 100 : 0
        };
    });
}

export async function getDetailedUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            guest: {
                select: {
                    Hostel: {
                        select: {
                            hostelName: true
                        }
                    }
                }
            },
            wardens: {
                select: {
                    hostelIds: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostelName: user.guest?.Hostel?.hostelName ||
            user.wardens?.[0]?.hostelIds?.[0] || 'N/A',
        createdAt: user.createdAt
    }));
}
