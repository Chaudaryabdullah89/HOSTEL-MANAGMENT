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
        const reportType = searchParams.get('type') || 'summary';

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

        switch (reportType) {
            case 'revenue':
                return await getRevenueReport(dateFilter, hostelFilter);
            case 'expenses':
                return await getExpensesReport(dateFilter, hostelFilter);
            case 'profit-loss':
                return await getProfitLossReport(dateFilter, hostelFilter);
            case 'monthly-trend':
                return await getMonthlyTrendReport(dateFilter, hostelFilter);
            default:
                return await getFinancialSummary(dateFilter, hostelFilter);
        }
    } catch (error) {
        console.error("Error fetching financial reports:", error);
        return NextResponse.json(
            { error: "Failed to fetch financial reports" },
            { status: 500 }
        );
    }
}

async function getFinancialSummary(dateFilter: any, hostelFilter: any) {
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

    const totalRevenue = bookingPayments._sum.amount || 0;
    const totalExpenses = salaryPayments._sum.netAmount || 0;
    const pendingRevenue = pendingPayments._sum.amount || 0;
    const netProfit = totalRevenue - totalExpenses;

    return NextResponse.json({
        summary: {
            totalRevenue,
            totalExpenses,
            pendingRevenue,
            netProfit,
            profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
            bookingCount: bookingPayments._count.amount || 0,
            salaryCount: salaryPayments._count.netAmount || 0,
            pendingCount: pendingPayments._count.amount || 0
        }
    });
}

async function getRevenueReport(dateFilter: any, hostelFilter: any) {
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

    return NextResponse.json({
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
    });
}

async function getExpensesReport(dateFilter: any, hostelFilter: any) {
    // Get salary expenses by department
    const salaryExpenses = await prisma.salary.findMany({
        where: {
            ...dateFilter,
            status: "PAID"
        },
        include: {
            staff: {
                select: {
                    department: true,
                    position: true
                }
            }
        }
    });

    // Group by department
    const expensesByDepartment = salaryExpenses.reduce((acc: any, salary: any) => {
        const department = salary.staff?.department || 'Unknown';
        if (!acc[department]) {
            acc[department] = { amount: 0, count: 0 };
        }
        acc[department].amount += salary.netAmount;
        acc[department].count += 1;
        return acc;
    }, {});

    return NextResponse.json({
        expensesByDepartment: Object.entries(expensesByDepartment).map(([department, data]: [string, any]) => ({
            department,
            amount: data.amount,
            count: data.count
        }))
    });
}

async function getProfitLossReport(dateFilter: any, hostelFilter: any) {
    // Get monthly revenue and expenses for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await prisma.payment.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: {
                gte: twelveMonthsAgo
            },
            booking: {
                ...hostelFilter
            },
            status: "COMPLETED"
        },
        _sum: {
            amount: true
        }
    });

    const monthlyExpenses = await prisma.salary.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: {
                gte: twelveMonthsAgo
            },
            status: "PAID"
        },
        _sum: {
            netAmount: true
        }
    });

    // Combine and format data
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);

        const revenue = monthlyRevenue.find((item: any) => 
            item.createdAt.toISOString().slice(0, 7) === monthKey
        )?._sum.amount || 0;

        const expenses = monthlyExpenses.find((item: any) => 
            item.createdAt.toISOString().slice(0, 7) === monthKey
        )?._sum.netAmount || 0;

        monthlyData.push({
            month: monthKey,
            revenue,
            expenses,
            profit: revenue - expenses
        });
    }

    return NextResponse.json({
        monthlyData
    });
}

async function getMonthlyTrendReport(dateFilter: any, hostelFilter: any) {
    // Get daily revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await prisma.payment.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: {
                gte: thirtyDaysAgo
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

    return NextResponse.json({
        dailyRevenue: dailyRevenue.map((item: any) => ({
            date: item.createdAt.toISOString().split('T')[0],
            revenue: item._sum.amount || 0,
            bookings: item._count.amount || 0
        }))
    });
}
