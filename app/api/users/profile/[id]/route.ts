/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureConnection } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(request);

        // Check if user is logged in
        if (!session || !session.loggedIn) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only admins can view user profiles
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden: Only admins can view user profiles" },
                { status: 403 }
            );
        }

        await ensureConnection();

        const { id: userId } = await params;

        // Fetch user with all related data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                address: true,
                admin: true,
                wardens: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                guest: {
                    include: {
                        Hostel: {
                            select: {
                                id: true,
                                hostelName: true,
                                address: true,
                            }
                        }
                    }
                },
                bookings: {
                    include: {
                        hostel: {
                            select: {
                                id: true,
                                hostelName: true,
                                address: true,
                            }
                        },
                        room: {
                            select: {
                                id: true,
                                roomNumber: true,
                                floor: true,
                                type: true,
                                pricePerNight: true,
                                pricePerMonth: true,
                            }
                        },
                        payment: {
                            select: {
                                id: true,
                                amount: true,
                                method: true,
                                status: true,
                                transactionId: true,
                                createdAt: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionId: true,
                        createdAt: true,
                        notes: true,
                        bookingId: true,
                        booking: {
                            select: {
                                id: true,
                                checkin: true,
                                checkout: true,
                                status: true,
                            }
                        },
                        hostel: {
                            select: {
                                id: true,
                                hostelName: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                maintenances: {
                    include: {
                        hostel: {
                            select: {
                                id: true,
                                hostelName: true,
                            }
                        },
                        room: {
                            select: {
                                id: true,
                                roomNumber: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Calculate statistics
        const totalBookings = user.bookings.length;
        const activeBookings = user.bookings.filter((b: any) => b.status === "CHECKED_IN").length;
        const completedBookings = user.bookings.filter((b: any) => b.status === "CHECKED_OUT").length;
        const cancelledBookings = user.bookings.filter((b: any) => b.status === "CANCELLED").length;

        const totalPayments = user.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
        const paidPayments = user.payments.filter((p: any) => p.status === "PAID").length;
        const pendingPayments = user.payments.filter((p: any) => p.status === "PENDING").length;

        const totalMaintenanceRequests = user.maintenances.length;
        const pendingMaintenanceRequests = user.maintenances.filter((m: any) => m.status === "PENDING").length;
        const resolvedMaintenanceRequests = user.maintenances.filter((m: any) => m.status === "RESOLVED").length;

        // Return user data with statistics
        return NextResponse.json({
            user: {
                ...user,
                password: undefined, // Don't send password
            },
            statistics: {
                bookings: {
                    total: totalBookings,
                    active: activeBookings,
                    completed: completedBookings,
                    cancelled: cancelledBookings,
                },
                payments: {
                    total: totalPayments,
                    paid: paidPayments,
                    pending: pendingPayments,
                },
                maintenance: {
                    total: totalMaintenanceRequests,
                    pending: pendingMaintenanceRequests,
                    resolved: resolvedMaintenanceRequests,
                }
            }
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch user profile" },
            { status: 500 }
        );
    }
}

