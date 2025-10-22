import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import * as XLSX from 'xlsx';

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

        // Fetch comprehensive data via HTTP
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (hostelId) params.append('hostelId', hostelId);

        const response = await fetch(`${baseUrl}/api/reports/comprehensive?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch report data');
        }

        const data = await response.json();

        // Create Excel workbook
        const workbook = XLSX.utils.book_new();

        // 1. Summary Sheet
        const summaryData = [
            ['HOSTEL MANAGEMENT SYSTEM - COMPREHENSIVE REPORT'],
            ['Generated on:', new Date().toLocaleString()],
            ['Report Period:', `${startDate || 'N/A'} to ${endDate || 'N/A'}`],
            [''],
            ['SUMMARY METRICS'],
            ['Total Users', data.summary.totalUsers],
            ['Total Guests', data.summary.guestsCount],
            ['Total Staff', data.summary.staffCount],
            ['Active Guests', data.summary.activeGuests],
            ['Total Bookings', data.summary.totalBookings],
            ['Total Revenue', `PKR ${data.summary.totalRevenue?.toLocaleString() || 0}`],
            ['Total Expenses', `PKR ${data.summary.totalExpenses?.toLocaleString() || 0}`],
            ['Net Profit', `PKR ${data.summary.netProfit?.toLocaleString() || 0}`],
            ['Profit Margin', `${data.summary.profitMargin || 0}%`],
            ['Occupancy Rate', `${data.summary.occupancyRate || 0}%`],
            ['Total Rooms', data.summary.totalRooms],
            ['Occupied Rooms', data.summary.occupiedRooms],
            [''],
            ['FINANCIAL BREAKDOWN'],
            ['Revenue by Payment Method:'],
            ...data.financial.revenueByMethod.map((item: any) => [
                `  ${item.method}`,
                `PKR ${item.amount.toLocaleString()}`,
                `${item.count} transactions`
            ]),
            [''],
            ['Revenue by Room Type:'],
            ...data.financial.revenueByRoomType.map((item: any) => [
                `  ${item.roomType}`,
                `PKR ${item.amount.toLocaleString()}`,
                `${item.count} bookings`
            ])
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

        // 2. Financial Details Sheet
        const financialSheetData = [
            ['FINANCIAL OVERVIEW'],
            ['Metric', 'Value'],
            ['Total Revenue', data.summary.totalRevenue],
            ['Total Expenses', data.summary.totalExpenses],
            ['Net Profit', data.summary.netProfit],
            ['Profit Margin (%)', data.summary.profitMargin],
            ['Pending Revenue', data.summary.pendingRevenue],
            [''],
            ['REVENUE BY PAYMENT METHOD'],
            ['Method', 'Amount (PKR)', 'Transaction Count'],
            ...data.financial.revenueByMethod.map((item: any) => [
                item.method,
                item.amount,
                item.count
            ]),
            [''],
            ['REVENUE BY ROOM TYPE'],
            ['Room Type', 'Amount (PKR)', 'Booking Count'],
            ...data.financial.revenueByRoomType.map((item: any) => [
                item.roomType,
                item.amount,
                item.count
            ])
        ];

        const financialSheet = XLSX.utils.aoa_to_sheet(financialSheetData);
        XLSX.utils.book_append_sheet(workbook, financialSheet, "Financial");

        // 3. Bookings Sheet
        const bookingsData = [
            ['BOOKINGS DETAILS'],
            ['Booking ID', 'Guest Name', 'Guest Email', 'Room Number', 'Floor', 'Room Type',
                'Hostel', 'Check-in Date', 'Check-out Date', 'Status', 'Price (PKR)', 'Booking Type', 'Created At'],
            ...data.bookings.map((booking: any) => [
                booking.id,
                booking.guestName,
                booking.guestEmail,
                booking.roomNumber,
                booking.floor,
                booking.roomType,
                booking.hostelName,
                new Date(booking.checkin).toLocaleDateString(),
                new Date(booking.checkout).toLocaleDateString(),
                booking.status,
                booking.price,
                booking.bookingType,
                new Date(booking.createdAt).toLocaleString()
            ])
        ];

        const bookingsSheet = XLSX.utils.aoa_to_sheet(bookingsData);
        XLSX.utils.book_append_sheet(workbook, bookingsSheet, "Bookings");

        // 4. Payments Sheet
        const paymentsData = [
            ['PAYMENT TRANSACTIONS'],
            ['Payment ID', 'Booking ID', 'Guest Name', 'Room Number', 'Amount (PKR)',
                'Payment Method', 'Status', 'Description', 'Receipt URL', 'Created At'],
            ...data.payments.map((payment: any) => [
                payment.id,
                payment.bookingId,
                payment.guestName,
                payment.roomNumber,
                payment.amount,
                payment.method,
                payment.status,
                payment.description || 'N/A',
                payment.receiptUrl || 'N/A',
                new Date(payment.createdAt).toLocaleString()
            ])
        ];

        const paymentsSheet = XLSX.utils.aoa_to_sheet(paymentsData);
        XLSX.utils.book_append_sheet(workbook, paymentsSheet, "Payments");

        // 5. Rooms Sheet
        const roomsData = [
            ['ROOMS PERFORMANCE'],
            ['Room ID', 'Room Number', 'Floor', 'Type', 'Status', 'Price/Night (PKR)',
                'Price/Month (PKR)', 'Total Revenue (PKR)', 'Booking Count', 'Occupancy Rate (%)'],
            ...data.rooms.map((room: any) => [
                room.id,
                room.roomNumber,
                room.floor,
                room.type,
                room.status,
                room.pricePerNight,
                room.pricePerMonth,
                room.totalRevenue,
                room.bookingCount,
                room.occupancyRate
            ])
        ];

        const roomsSheet = XLSX.utils.aoa_to_sheet(roomsData);
        XLSX.utils.book_append_sheet(workbook, roomsSheet, "Rooms");

        // 6. Maintenance Sheet
        const maintenanceSheetData = [
            ['MAINTENANCE REQUESTS'],
            ['Request ID', 'Title', 'Description', 'Status', 'Priority', 'Room Number',
                'Floor', 'Assigned To', 'Reported At', 'Created At'],
            ...data.maintenance.details.map((req: any) => [
                req.id,
                req.title,
                req.description,
                req.status,
                req.priority,
                req.roomNumber,
                req.floor,
                req.assignee,
                new Date(req.reportedAt).toLocaleDateString(),
                new Date(req.createdAt).toLocaleString()
            ])
        ];

        const maintenanceSheet = XLSX.utils.aoa_to_sheet(maintenanceSheetData);
        XLSX.utils.book_append_sheet(workbook, maintenanceSheet, "Maintenance");

        // 7. Expenses Sheet
        const expensesData = [
            ['EXPENSE RECORDS'],
            ['Expense ID', 'Title', 'Description', 'Category', 'Amount (PKR)',
                'Status', 'Submitted By', 'Submitted At', 'Created At'],
            ...data.expenses.details.map((expense: any) => [
                expense.id,
                expense.title,
                expense.description,
                expense.category,
                expense.amount,
                expense.status,
                expense.submittedBy,
                new Date(expense.submittedAt).toLocaleDateString(),
                new Date(expense.createdAt).toLocaleString()
            ])
        ];

        const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
        XLSX.utils.book_append_sheet(workbook, expensesSheet, "Expenses");

        // 8. Salaries Sheet
        const salariesData = [
            ['PAYROLL RECORDS'],
            ['Salary ID', 'Staff Name', 'Position', 'Department', 'Pay Date',
                'Base Amount (PKR)', 'Net Amount (PKR)', 'Status'],
            ...data.salary.details.map((salary: any) => [
                salary.id,
                salary.staffName,
                salary.position,
                salary.department,
                new Date(salary.payDate).toLocaleDateString(),
                salary.baseAmount,
                salary.netAmount,
                salary.status
            ])
        ];

        const salariesSheet = XLSX.utils.aoa_to_sheet(salariesData);
        XLSX.utils.book_append_sheet(workbook, salariesSheet, "Salaries");

        // 9. Users Sheet
        const usersData = [
            ['USER RECORDS'],
            ['User ID', 'Name', 'Email', 'Role', 'Hostel', 'Created At'],
            ...data.users.map((user: any) => [
                user.id,
                user.name,
                user.email,
                user.role,
                user.hostelName,
                new Date(user.createdAt).toLocaleString()
            ])
        ];

        const usersSheet = XLSX.utils.aoa_to_sheet(usersData);
        XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");

        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx',
            compression: true
        });

        // Create filename with date range
        const startDateStr = startDate ? new Date(startDate).toISOString().split('T')[0] : 'all';
        const endDateStr = endDate ? new Date(endDate).toISOString().split('T')[0] : 'all';
        const filename = `hostel-report-${startDateStr}-to-${endDateStr}.xlsx`;

        // Return Excel file
        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': excelBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error("Error generating Excel report:", error);
        return NextResponse.json(
            { error: "Failed to generate Excel report" },
            { status: 500 }
        );
    }
}
