import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

        const activeBookings = await prisma.booking.findMany({
            where: {
                status: {
                    in: ['CONFIRMED', 'CHECKED_IN']
                }
            },
            include: {
                room: {
                    select: {
                        id: true,
                        roomNumber: true,
                        pricePerMonth: true,
                        pricePerNight: true,
                        hostelId: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                payment: true
            }
        });

        const createdPayments = [];
        const skippedBookings = [];

        for (const booking of activeBookings) {
            if (booking.payment) {
                skippedBookings.push({
                    bookingId: booking.id,
                    reason: "Payment already exists for this booking",
                    existingPayment: booking.payment.id
                });
                continue;
            }

            let paymentAmount = 0;
            if (booking.bookingType === 'MONTHLY' && booking.room?.pricePerMonth) {
                paymentAmount = booking.room.pricePerMonth;
            } else if (booking.bookingType === 'DAILY' && booking.room?.pricePerNight) {
                const checkin = new Date(booking.checkin);
                const checkout = new Date(booking.checkout);
                const duration = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
                paymentAmount = booking.room.pricePerNight * duration;
            }

            if (paymentAmount <= 0) {
                skippedBookings.push({
                    bookingId: booking.id,
                    reason: "No valid payment amount calculated",
                    bookingType: booking.bookingType,
                    roomPrice: booking.room?.pricePerMonth || booking.room?.pricePerNight
                });
                continue;
            }

            try {
                // Create payment
                const payment = await prisma.payment.create({
                    data: {
                        bookingId: booking.id,
                        userId: booking.userId,
                        hostelId: booking.hostelId,
                        roomId: booking.roomId,
                        amount: paymentAmount,
                        method: 'AUTO_GENERATED',
                        status: 'PENDING',
                        notes: `Auto-generated payment for ${booking.bookingType.toLowerCase()} booking - ${currentDate.toLocaleDateString()}`,
                        transactionId: `AUTO_${booking.id}_${Date.now()}`,
                        approvalStatus: 'PENDING'
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        booking: {
                            select: {
                                id: true,
                                checkin: true,
                                checkout: true,
                                bookingType: true
                            }
                        }
                    }
                });

                createdPayments.push({
                    paymentId: payment.id,
                    bookingId: booking.id,
                    guestName: booking.user?.name,
                    roomNumber: booking.room?.roomNumber,
                    amount: paymentAmount,
                    bookingType: booking.bookingType
                });
            } catch (error) {
                skippedBookings.push({
                    bookingId: booking.id,
                    reason: "Database error during payment creation",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        const result = {
            success: true,
            message: `Automated payment creation completed for ${currentDate.toLocaleDateString()}`,
            summary: {
                totalActiveBookings: activeBookings.length,
                paymentsCreated: createdPayments.length,
                bookingsSkipped: skippedBookings.length
            },
            createdPayments,
            skippedBookings
        };

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { 
                error: "Failed to create automated payments",
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}
