import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { requireWardenAuth } from "@/lib/warden-auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is warden and get their hostel assignments
        let wardenHostelIds: string[] = [];
        try {
            const wardenAuth = await requireWardenAuth(request);
            wardenHostelIds = wardenAuth.hostelIds;
        } catch (error) {
            // If not a warden, continue without filtering (admin access)
            console.log("No warden auth, showing all salary reports");
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'summary';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const staffId = searchParams.get('staffId');

        let whereClause: any = {};

        if (startDate && endDate) {
            whereClause.payDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (staffId) {
            whereClause.staffId = staffId;
        }

        // Add warden filtering for salary reports
        if (wardenHostelIds.length > 0) {
            whereClause.staff = {
                hostelId: { in: wardenHostelIds }
            };
        }

        switch (type) {
            case 'summary':
                return await getSummaryReport(whereClause);
            case 'monthly':
                return await getMonthlyReport(whereClause);
            case 'staff':
                return await getStaffReport(whereClause);
            case 'payroll':
                return await getPayrollReport(whereClause);
            default:
                return await getSummaryReport(whereClause);
        }
    } catch (error) {
        console.error("Error generating salary report:", error);
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}

async function getSummaryReport(whereClause: any) {
    const salaries = await prisma.salary.findMany({
        where: whereClause,
        include: {
            staff: {
                select: {
                    id: true,
                    name: true,
                    position: true
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

    const totalFailed = salaries
        .filter((s: any) => s.status === 'FAILED')
        .reduce((sum: number, s: any) => sum + s.netAmount, 0);

    const statusBreakdown = salaries.reduce((acc: Record<string, number>, salary: any) => {
        acc[salary.status] = (acc[salary.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const uniqueStaff = new Set(salaries.map((s: any) => s.staffId)).size;
    const averageSalary = salaries.length > 0 ? salaries.reduce((sum: number, s: any) => sum + s.netAmount, 0) / salaries.length : 0;
    const averageSalaryPerStaff = uniqueStaff > 0 ? totalPaid / uniqueStaff : 0;

    return NextResponse.json({
        summary: {
            totalPaid,
            totalPending,
            totalFailed,
            averageSalary,
            averageSalaryPerStaff,
            totalStaff: uniqueStaff,
            statusBreakdown
        }
    });
}

async function getMonthlyReport(whereClause: any) {
    const salaries = await prisma.salary.findMany({
        where: whereClause,
        include: {
            staff: {
                select: {
                    name: true,
                    position: true
                }
            }
        }
    });

    // Group by month
    const monthlyData = salaries.reduce((acc: Record<string, any>, salary: any) => {
        const month = new Date(salary.payDate).toISOString().substring(0, 7); // YYYY-MM
        if (!acc[month]) {
            acc[month] = {
                month,
                totalAmount: 0,
                totalSalaries: 0,
                statusBreakdown: {}
            };
        }
        acc[month].totalAmount += salary.netAmount;
        acc[month].totalSalaries += 1;
        acc[month].statusBreakdown[salary.status] = (acc[month].statusBreakdown[salary.status] || 0) + 1;
        return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
        monthlyReport: Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month))
    });
}

async function getStaffReport(whereClause: any) {
    const salaries = await prisma.salary.findMany({
        where: whereClause,
        include: {
            staff: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    position: true,
                    department: true
                }
            }
        }
    });

    // Group by staff
    const staffData = salaries.reduce((acc: Record<string, any>, salary: any) => {
        const staffId = salary.staffId;
        if (!acc[staffId]) {
            acc[staffId] = {
                staff: salary.staff,
                totalAmount: 0,
                totalSalaries: 0,
                lastPayDate: null,
                statusBreakdown: {}
            };
        }
        acc[staffId].totalAmount += salary.netAmount;
        acc[staffId].totalSalaries += 1;
        acc[staffId].lastPayDate = salary.payDate > acc[staffId].lastPayDate ? salary.payDate : acc[staffId].lastPayDate;
        acc[staffId].statusBreakdown[salary.status] = (acc[staffId].statusBreakdown[salary.status] || 0) + 1;
        return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
        staffReport: Object.values(staffData)
    });
}

async function getPayrollReport(whereClause: any) {
    const salaries = await prisma.salary.findMany({
        where: whereClause,
        include: {
            staff: {
                select: {
                    name: true,
                    position: true,
                    department: true
                }
            }
        }
    });

    const payrollData = salaries.map((salary: any) => ({
        id: salary.id,
        staffName: salary.staff.name,
        position: salary.staff.position,
        department: salary.staff.department,
        payDate: salary.payDate,
        payPeriod: salary.payPeriod,
        baseAmount: salary.baseAmount,
        overtimeAmount: salary.overtimeAmount,
        bonusAmount: salary.bonusAmount,
        deductions: salary.deductions,
        netAmount: salary.netAmount,
        status: salary.status,
        currency: salary.currency
    }));

    return NextResponse.json({
        payrollReport: payrollData
    });
}
