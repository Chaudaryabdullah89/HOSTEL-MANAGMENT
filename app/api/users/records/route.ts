import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session || !session.user || !session.user.role) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        await ensureConnection();

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: "Email parameter is required" },
                { status: 400 }
            );
        }


        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                address: true,
                bookings: {
                    include: {
                        room: {
                            select: {
                                roomNumber: true,
                                floor: true,
                                type: true,
                                pricePerNight: true,
                                pricePerMonth: true,
                            },
                        },
                        hostel: {
                            select: {
                                hostelName: true,
                                address: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                payments: {
                    include: {
                        booking: {
                            select: {
                                room: {
                                    select: {
                                        roomNumber: true
                                    }
                                },
                                checkin: true,
                                checkout: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                maintenances: {
                    include: {
                        room: {
                            select: {
                                roomNumber: true,
                                floor: true
                            }
                        },
                        assignee: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                guest: {
                    include: {
                        Hostel: {
                            select: {
                                hostelName: true,
                                address: true
                            }
                        }
                    }
                },
                wardens: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }



        const userBookings = await prisma.booking.findMany({
            where: { userId: user.id },
            select: { id: true }
        });

        const bookingIds = userBookings.map((booking: any) => booking.id);
        const allPaymentsForUserBookings = await prisma.payment.findMany({
            where: { bookingId: { in: bookingIds } },
            select: { id: true, userId: true, amount: true, method: true, bookingId: true }
        });

        console.log('All payments for user bookings:', allPaymentsForUserBookings.length);
        console.log('Payments with different userId:', allPaymentsForUserBookings.filter((p: any) => p.userId !== user.id));

        const totalBookings = user.bookings.length;
        const totalPayments = user.payments.length;
        const totalMaintenanceRequests = user.maintenances.length;
        const totalAmountPaid = user.payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
        const activeBookings = user.bookings.filter((booking: any) =>
            booking.status === 'confirmed' || booking.status === 'pending'
        ).length;
        const completedBookings = user.bookings.filter((booking: any) =>
            booking.status === 'completed'
        ).length;
        const pendingPayments = user.payments.filter((payment: any) =>
            payment.status === 'pending'
        ).length;
        const completedPayments = user.payments.filter((payment: any) =>
            payment.status === 'completed'
        ).length;
        const pendingMaintenance = user.maintenances.filter((maintenance: any) =>
            maintenance.status === 'pending'
        ).length;



        // Get all payments for user's bookings (including those with different userId)
        const allUserPayments = await prisma.payment.findMany({
            where: {
                OR: [
                    { userId: user.id }, // Direct payments by user
                    { bookingId: { in: bookingIds } } // Payments for user's bookings
                ]
            },
            include: {
                booking: {
                    select: {
                        room: {
                            select: {
                                roomNumber: true
                            }
                        },
                        checkin: true,
                        checkout: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Add bookings to recent activity
        const bookingActivities = user.bookings.map((booking: any) => ({
            type: 'booking',
            id: booking.id,
            title: `Booking for Room ${booking.room?.roomNumber || 'TBD'}`,
            description: `${booking.hostel.hostelName} - ${booking.room?.type || 'Standard'}`,
            status: booking.status,
            date: booking.createdAt,
            details: {
                checkin: booking.checkin,
                checkout: booking.checkout,
                price: booking.price
            }
        }));

        // Add payments to recent activity
        const paymentActivities = allUserPayments.map((payment: any) => ({
            type: 'payment',
            id: payment.id,
            title: `Payment for Booking #${payment.bookingId?.slice(-8) || 'N/A'}`,
            description: `Room ${payment.booking?.room?.roomNumber || 'TBD'}`,
            status: payment.status,
            amount: payment.amount,
            date: payment.createdAt,
            details: {
                method: payment.method,
                description: payment.description
            }
        }));

        // Add maintenance requests to recent activity
        const maintenanceActivities = user.maintenances.map((maintenance: any) => ({
            type: 'maintenance',
            id: maintenance.id,
            title: maintenance.title,
            description: `Room ${maintenance.room?.roomNumber || 'N/A'} - Floor ${maintenance.room?.floor || 'N/A'}`,
            status: maintenance.status,
            priority: maintenance.priority,
            date: maintenance.createdAt,
            details: {
                description: maintenance.description,
                assignee: maintenance.assignee?.name
            }
        }));

        // Combine all activities and sort by date
        const allActivities = [...bookingActivities, ...paymentActivities, ...maintenanceActivities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        // Recalculate summary with all payments
        const totalPaymentsAll = allUserPayments.length;
        const totalAmountPaidAll = allUserPayments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
        const pendingPaymentsAll = allUserPayments.filter((payment: any) =>
            payment.status === 'pending'
        ).length;
        const completedPaymentsAll = allUserPayments.filter((payment: any) =>
            payment.status === 'completed'
        ).length;

        const userRecords = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                image: user.image,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                address: user.address,
                guestInfo: user.guest,
                wardenInfo: user.wardens
            },
            summary: {
                totalBookings,
                activeBookings,
                completedBookings,
                totalPayments: totalPaymentsAll,
                pendingPayments: pendingPaymentsAll,
                completedPayments: completedPaymentsAll,
                totalMaintenanceRequests,
                pendingMaintenance,
                totalAmountPaid: totalAmountPaidAll
            },
            bookings: user.bookings,
            payments: allUserPayments, // Use all payments for user's bookings
            maintenances: user.maintenances,
            recentActivity: allActivities
        };

        // console.log('User records:', userRecords);  
        return NextResponse.json(userRecords);
    } catch (error) {
        console.error("Error fetching user records:", error);
        return NextResponse.json(
            { error: "Failed to fetch user records" },
            { status: 500 }
        );
    }
}
