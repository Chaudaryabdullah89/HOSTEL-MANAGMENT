import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get notifications for admin users
        if (session.user.role !== 'ADMIN' && session.user.role !== 'WARDEN') {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Get recent bookings that need attention
        const recentBookings = await prisma.booking.findMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                room: {
                    select: {
                        roomNumber: true,
                        type: true
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

        // Get new user registrations
        const newUsers = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get pending payments
        const pendingPayments = await prisma.payment.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                booking: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const notifications = {
            newBookings: recentBookings.map(booking => ({
                id: booking.id,
                type: 'booking',
                title: 'New Booking Request',
                message: `${booking.user.name} (${booking.user.role}) requested booking for Room ${booking.room.roomNumber} in ${booking.hostel.hostelName}`,
                user: booking.user,
                booking: {
                    id: booking.id,
                    roomNumber: booking.room.roomNumber,
                    hostelName: booking.hostel.hostelName,
                    checkin: booking.checkin,
                    checkout: booking.checkout,
                    price: booking.price
                },
                createdAt: booking.createdAt,
                priority: 'high'
            })),
            newUsers: newUsers.map(user => ({
                id: user.id,
                type: 'user',
                title: 'New User Registration',
                message: `${user.name} (${user.role}) has registered`,
                user: user,
                createdAt: user.createdAt,
                priority: 'medium'
            })),
            pendingPayments: pendingPayments.map(payment => ({
                id: payment.id,
                type: 'payment',
                title: 'Pending Payment',
                message: `Payment of ${payment.amount} PKR pending for ${payment.booking.user.name}`,
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    method: payment.method,
                    createdAt: payment.createdAt
                },
                user: payment.booking.user,
                createdAt: payment.createdAt,
                priority: 'high'
            }))
        };

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type, message, userId, bookingId, paymentId } = await request.json();

        // Create notification
        const notification = await prisma.notification.create({
            data: {
                type,
                message,
                userId,
                bookingId,
                paymentId,
                isRead: false
            }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json(
            { error: "Failed to create notification" },
            { status: 500 }
        );
    }
}
