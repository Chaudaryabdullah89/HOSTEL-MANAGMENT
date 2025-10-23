import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

// NEW APPROACH: All stats in one aggregate query per entity, flatten, minimize post-fetch processing, read-only, robust error handling.
// Each stats section fetched independently, parallelized. No extra mapping is done unless necessary.

export async function GET(request: NextRequest) {
    try {
        // Session check
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Query params 
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const hostelId = searchParams.get("hostelId");

        // Filters
        const dateRange =
            startDate && endDate
                ? {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                }
                : undefined;

        // hostelId could be undefined; build where for entities that have hostelId (most do, but not all)
        const hostelWhere = hostelId ? { hostelId } : {};

        // For things like payment/booking, we may need to OR both payment.hostelId and payment.booking.hostelId
        const paymentOr =
            hostelId && hostelId.length > 0
                ? [{ hostelId }, { booking: { hostelId } }]
                : [{}];

        // DATA GATHER
        const [
            userStats,
            bookingStats,
            roomStats,
            paymentStats,
            salaryStats,
            maintenanceStats,
            expenseStats,
        ] = await Promise.all([
            // User stats
            prisma.user.groupBy({
                by: ["role"],
                _count: { id: true },
            }),
            // Booking stats
            prisma.booking.aggregate({
                where: {
                    ...(dateRange ? { createdAt: dateRange } : {}),
                    ...hostelWhere,
                },
                _count: { id: true },
                _sum: { price: true },
            }),
            // Room stats (occupancy breakdown)
            Promise.all([
                prisma.room.count({ where: { ...hostelWhere } }),
                prisma.room.count({ where: { ...hostelWhere, status: "OCCUPIED" } }),
            ]),
            // Payments aggregation
            (async () => {
                // Completed
                const completed = await prisma.payment.aggregate({
                    where: {
                        status: "COMPLETED",
                        ...(dateRange ? { createdAt: dateRange } : {}),
                        ...(paymentOr.length === 1 && !Object.keys(paymentOr[0]).length
                            ? {}
                            : { OR: paymentOr }),
                    },
                    _sum: { amount: true },
                    _count: { id: true },
                });
                // Pending
                const pending = await prisma.payment.aggregate({
                    where: {
                        status: "PENDING",
                        ...(dateRange ? { createdAt: dateRange } : {}),
                        ...(paymentOr.length === 1 && !Object.keys(paymentOr[0]).length
                            ? {}
                            : { OR: paymentOr }),
                    },
                    _sum: { amount: true },
                    _count: { id: true },
                });
                // By method
                const byMethod = await prisma.payment.groupBy({
                    by: ["method"],
                    where: {
                        status: "COMPLETED",
                        ...(dateRange ? { createdAt: dateRange } : {}),
                        ...(paymentOr.length === 1 && !Object.keys(paymentOr[0]).length
                            ? {}
                            : { OR: paymentOr }),
                    },
                    _sum: { amount: true },
                    _count: { id: true },
                });
                // By booking.room.type (do this separately for clarity)
                const roomPayments = await prisma.payment.findMany({
                    where: {
                        status: "COMPLETED",
                        ...(dateRange ? { createdAt: dateRange } : {}),
                        booking: {
                            isNot: null,
                            ...(hostelId ? { hostelId } : {}),
                        },
                    },
                    include: {
                        booking: { include: { room: { select: { type: true } } } },
                    },
                });
                const revenueByRoomType: Record<string, { amount: number; count: number }> = {};
                for (const p of roomPayments) {
                    const type = p.booking?.room?.type || "Unknown";
                    revenueByRoomType[type] = revenueByRoomType[type] || {
                        amount: 0,
                        count: 0,
                    };
                    revenueByRoomType[type].amount += p.amount;
                    revenueByRoomType[type].count += 1;
                }
                return {
                    completed,
                    pending,
                    byMethod,
                    revenueByRoomType,
                };
            })(),
            // Salary
            prisma.salary.findMany({
                where: { ...(dateRange ? { createdAt: dateRange } : {}) },
                include: {
                    staff: {
                        select: {
                            id: true,
                            name: true,
                            position: true,
                            department: true,
                        },
                    },
                },
            }),
            // Maintenance
            (async () => {
                const where = {
                    ...hostelWhere,
                    ...(dateRange ? { reportedAt: dateRange } : {}),
                };
                const total = await prisma.maintenance.count({ where });
                const status = await prisma.maintenance.groupBy({
                    by: ["status"],
                    where,
                    _count: { id: true },
                });
                const prio = await prisma.maintenance.groupBy({
                    by: ["priority"],
                    where,
                    _count: { id: true },
                });
                const details = await prisma.maintenance.findMany({
                    where,
                    include: {
                        room: { select: { roomNumber: true, floor: true } },
                        assignee: { select: { name: true } },
                    },
                    orderBy: { reportedAt: "desc" },
                });
                return { total, status, prio, details };
            })(),
            // Expense
            (async () => {
                const where = {
                    ...hostelWhere,
                    ...(dateRange ? { submittedAt: dateRange } : {}),
                };
                const total = await prisma.expense.count({ where });
                const agg = await prisma.expense.aggregate({
                    where,
                    _sum: { amount: true },
                    _avg: { amount: true },
                });
                const cat = await prisma.expense.groupBy({
                    by: ["category"],
                    where,
                    _sum: { amount: true },
                    _count: { id: true },
                });
                const details = await prisma.expense.findMany({
                    where,
                    include: { user: { select: { name: true } } },
                    orderBy: { submittedAt: "desc" },
                });
                return { total, agg, cat, details };
            })(),
        ]);

        // Compose flat summary

        // Users
        const userDict: Record<string, number> = {};
        userStats.forEach((u: any) => (userDict[u.role] = u._count.id));
        const totalUsers = Object.values(userDict).reduce((a, b) => a + b, 0);

        // Bookings
        const bookingCount = bookingStats._count.id || 0;
        const bookingRevenue = bookingStats._sum.price || 0;

        // Rooms
        const totalRooms = roomStats[0] || 0,
            occupiedRooms = roomStats[1] || 0;
        const occupancyRate = totalRooms
            ? Math.round((occupiedRooms / totalRooms) * 100)
            : 0;

        // Payments
        const paymentCompleted =
            paymentStats.completed._sum.amount != null
                ? paymentStats.completed._sum.amount
                : 0;
        const paymentPending =
            paymentStats.pending._sum.amount != null
                ? paymentStats.pending._sum.amount
                : 0;

        // Salary
        let totalPaid = 0,
            totalPending = 0,
            salaryStatus: Record<string, number> = {},
            staffSet: Set<any> = new Set(),
            salarySum = 0;
        for (const s of salaryStats) {
            if (s.status === "PAID") totalPaid += s.netAmount;
            if (s.status === "PENDING") totalPending += s.netAmount;
            salaryStatus[s.status] = (salaryStatus[s.status] || 0) + 1;
            staffSet.add(s.staffId);
            salarySum += s.netAmount;
        }
        const averageSalary = salaryStats.length
            ? salarySum / salaryStats.length
            : 0;

        // Maintenance summary
        const maintenanceSummary = {
            totalRequests: maintenanceStats.total,
            statusBreakdown: maintenanceStats.status.map((st: any) => ({
                status: st.status,
                count: st._count.id,
            })),
            priorityBreakdown: maintenanceStats.prio.map((p: any) => ({
                priority: p.priority,
                count: p._count.id,
            })),
        };

        // Expense summary
        const expenseSummary = {
            totalExpenses: expenseStats.total,
            totalAmount: expenseStats.agg._sum.amount || 0,
            avgAmount: expenseStats.agg._avg.amount || 0,
        };

        // Compose summary
        const totalExpenses =
            (salaryStats.length ? totalPaid : 0) +
            (expenseStats.agg._sum.amount || 0);
        const netProfit = paymentCompleted - totalExpenses;
        const profitMargin =
            paymentCompleted > 0
                ? parseFloat(((netProfit / paymentCompleted) * 100).toFixed(2))
                : 0;

        // Main summary
        const summary = {
            // Dashboard
            totalUsers,
            guestsCount: userDict["GUEST"] || 0,
            staffCount:
                (userDict["STAFF"] || 0) +
                (userDict["WARDEN"] || 0) +
                (userDict["ADMIN"] || 0),
            activeGuests: bookingCount, // Would need more logic for "CHECKED_IN"
            totalBookings: bookingCount,
            // Financial
            totalRevenue: paymentCompleted,
            pendingRevenue: paymentPending,
            totalExpenses,
            netProfit,
            profitMargin,
            // Room
            occupancyRate,
            totalRooms,
            occupiedRooms,
        };

        // Details: Each detail array can be derived with minimal postprocessing

        // Bookings
        const bookings = await prisma.booking.findMany({
            where: {
                ...(dateRange ? { createdAt: dateRange } : {}),
                ...hostelWhere,
            },
            include: {
                user: { select: { name: true, email: true } },
                room: {
                    select: {
                        roomNumber: true,
                        floor: true,
                        type: true,
                        pricePerNight: true,
                    },
                },
                hostel: {
                    select: { hostelName: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Payments
        const payments = await prisma.payment.findMany({
            where: {
                ...(dateRange ? { createdAt: dateRange } : {}),
                ...(paymentOr.length === 1 && !Object.keys(paymentOr[0]).length
                    ? {}
                    : { OR: paymentOr }),
            },
            include: {
                booking: {
                    include: {
                        room: { select: { roomNumber: true } },
                        user: { select: { name: true } },
                    },
                },
                user: { select: { name: true } },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Rooms
        const rooms = await prisma.room.findMany({
            where: hostelWhere,
            include: {
                bookings: {
                    where: {
                        status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
                    },
                    include: { payments: true },
                },
            },
        });

        // Users
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
                                hostelName: true,
                            },
                        },
                    },
                },
                wardens: {
                    select: {
                        hostelIds: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Respond
        return NextResponse.json({
            summary,
            financial: {
                summary: {
                    totalRevenue: paymentCompleted,
                    pendingRevenue: paymentPending,
                    totalExpenses: totalPaid,
                    paymentCount: paymentStats.completed._count.id || 0,
                    pendingCount: paymentStats.pending._count.id || 0,
                },
                revenueByMethod: paymentStats.byMethod.map((pm: any) => ({
                    method: pm.method,
                    amount: pm._sum.amount || 0,
                    count: pm._count.id || 0,
                })),
                revenueByRoomType: Object.entries(paymentStats.revenueByRoomType).map(
                    ([type, data]: any) => ({
                        roomType: type,
                        amount: data.amount,
                        count: data.count,
                    })
                ),
            },
            salary: {
                summary: {
                    totalPaid,
                    totalPending,
                    averageSalary,
                    totalStaff: staffSet.size,
                    statusBreakdown: salaryStatus,
                },
                details: salaryStats.map((salary: any) => ({
                    id: salary.id,
                    staffName: salary.staff?.name,
                    position: salary.staff?.position,
                    department: salary.staff?.department,
                    payDate: salary.payDate,
                    baseAmount: salary.baseAmount,
                    netAmount: salary.netAmount,
                    status: salary.status,
                })),
            },
            maintenance: {
                summary: maintenanceSummary,
                details: maintenanceStats.details.map((req: any) => ({
                    id: req.id,
                    title: req.title,
                    description: req.description,
                    status: req.status,
                    priority: req.priority,
                    roomNumber: req.room?.roomNumber || "N/A",
                    floor: req.room?.floor || "N/A",
                    assignee: req.assignee?.name || "Unassigned",
                    reportedAt: req.reportedAt,
                    createdAt: req.createdAt,
                })),
            },
            expenses: {
                summary: expenseSummary,
                categoryBreakdown: expenseStats.cat.map((item: any) => ({
                    category: item.category,
                    amount: item._sum.amount || 0,
                    count: item._count.id,
                })),
                details: expenseStats.details.map((expense: any) => ({
                    id: expense.id,
                    title: expense.title,
                    description: expense.description,
                    category: expense.category,
                    amount: expense.amount,
                    status: expense.status,
                    submittedBy: expense.user?.name || "Unknown",
                    submittedAt: expense.submittedAt,
                    createdAt: expense.createdAt,
                })),
            },
            bookings: bookings.map((booking: any) => ({
                id: booking.id,
                guestName: booking.user?.name || "Unknown",
                guestEmail: booking.user?.email || "",
                roomNumber: booking.room?.roomNumber || "N/A",
                floor: booking.room?.floor || "N/A",
                roomType: booking.room?.type || "Unknown",
                hostelName: booking.hostel?.hostelName || "Unknown",
                checkin: booking.checkin,
                checkout: booking.checkout,
                status: booking.status,
                price: booking.price,
                bookingType: booking.bookingType,
                createdAt: booking.createdAt,
            })),
            payments: payments.map((payment: any) => {
                let guestName = "Unknown",
                    roomNumber = "N/A",
                    description = "Payment";
                if (payment.booking) {
                    guestName = payment.booking.user?.name || "Unknown";
                    roomNumber = payment.booking.room?.roomNumber || "N/A";
                    description = "Booking payment";
                } else if (payment.user) {
                    guestName = payment.user.name || "Unknown";
                    description = "Direct payment";
                }
                return {
                    id: payment.id,
                    guestName,
                    roomNumber,
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    description,
                    notes: payment.notes,
                    createdAt: payment.createdAt,
                };
            }),
            rooms: rooms.map((room: any) => {
                const totalRevenue =
                    room.bookings.reduce(
                        (sum: number, booking: any) =>
                            sum +
                            (booking.payments?.reduce(
                                (p: number, pay: any) => p + (pay.amount || 0),
                                0
                            ) || 0),
                        0
                    ) || 0;
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
                    occupancyRate: room.status === "OCCUPIED" ? 100 : 0,
                };
            }),
            users: users.map((user: any) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hostelName:
                    user.guest?.Hostel?.hostelName ||
                    user.wardens?.[0]?.hostelIds?.[0] ||
                    "N/A",
                createdAt: user.createdAt,
            })),
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error generating new comprehensive report:", error);
        return NextResponse.json(
            { error: "Failed to generate comprehensive report" },
            { status: 500 }
        );
    }
}
