import { NextRequest, NextResponse } from "next/server";
import { BookingType, BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth"
import { updateRoomStatusBasedOnCapacity, isRoomAvailableForBooking, updateAllRoomStatuses } from "@/lib/room-utils";
import { googleSheetsService } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
    try {
        const { roomId, hostelId, checkin, checkout, price, bookingType, duration, notes, status, cancelledAt, cancelledBy, userId } = await request.json();
        const session = await getServerSession(request)

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        if (!roomId || !hostelId || !userId) {
            return NextResponse.json(
                { error: "Missing required fields: roomId, hostelId, userId" },
                { status: 400 }
            )
        }

        let checkinDate, checkoutDate;

        if (bookingType === 'MONTHLY') {
            checkinDate = checkin ? new Date(checkin) : new Date();
            checkoutDate = checkout ? new Date(checkout) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        } else {
            if (!checkin || !checkout) {
                return NextResponse.json(
                    { error: "Missing required fields: checkin, checkout (required for daily bookings)" },
                    { status: 400 }
                )
            }
            checkinDate = new Date(checkin);
            checkoutDate = new Date(checkout);
        }
        const hostel = await prisma.hostel.findUnique({
            where: {
                id: hostelId
            }
        })
        if (!hostel) {
            return NextResponse.json(
                { error: "Hostel not found" },
                { status: 404 }
            )
        }

        const room = await prisma.room.findUnique({
            where: {
                hostelId: hostelId,
                id: roomId
            }
        })
        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            )
        }

        let calculatedPrice = price;
        if (!calculatedPrice) {
            if (bookingType === 'MONTHLY') {
                calculatedPrice = room.pricePerMonth;
            } else {

                const durationInDays = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
                calculatedPrice = room.pricePerNight * durationInDays;
            }
        }

        const roomAvailability = await isRoomAvailableForBooking(roomId);
        if (!roomAvailability.available) {
            return NextResponse.json(
                { error: roomAvailability.reason },
                { status: 400 }
            )
        }

        let booking;
        try {
            booking = await prisma.booking.create({
                data: {
                    roomId,
                    hostelId,
                    checkin: checkinDate,
                    checkout: checkoutDate,
                    price: calculatedPrice ? Number(calculatedPrice) : undefined,
                    bookingType: bookingType ? bookingType as BookingType : undefined,
                    status: status ? (status.toUpperCase() as BookingStatus) : "PENDING",
                    duration: duration ? Number(duration) : (bookingType === 'MONTHLY' ? 30 : undefined),
                    notes,
                    cancelledBy: session?.user?.id || undefined,
                    userId: userId,
                },
                include: {
                    room: {
                        select: {
                            id: true,
                            roomNumber: true,
                            type: true,
                            pricePerNight: true,
                            pricePerMonth: true,
                            status: true,
                            amenities: true,
                            floor: true,
                        },
                    },
                    hostel: {
                        select: {
                            id: true,
                            hostelName: true,
                            floors: true,
                            amenities: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                    payments: {
                        select: {
                            id: true,
                            amount: true,
                            method: true,
                            status: true,
                            transactionId: true,
                            notes: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                }
            });
        } catch (prismaError) {
            console.error("Prisma booking.create failed:", prismaError);
            throw prismaError;
        }
        const updateuserrole = await prisma.user.update({
            where: { id: booking.user?.id || userId },
            data: { role: "GUEST" }
        })

        await updateRoomStatusBasedOnCapacity(roomId);
        await updateAllRoomStatuses();

        // Add booking to Google Sheets
        try {
            await googleSheetsService.addBooking({
                id: booking.id,
                guestName: booking.user?.name || 'N/A',
                guestEmail: booking.user?.email || 'N/A',
                roomNumber: booking.room?.roomNumber || 'N/A',
                checkin: booking.checkin,
                checkout: booking.checkout,
                status: booking.status,
                price: booking.price,
                createdAt: booking.createdAt
            });
        } catch (sheetsError) {
            console.error('Failed to add booking to Google Sheets:', sheetsError);
            // Don't fail the booking creation if Google Sheets fails
        }

        const updatedRoom = await prisma.room.findUnique({
            where: { id: roomId },
            select: {
                id: true,
                roomNumber: true,
                status: true,
                capacity: true
            }
        });

        return NextResponse.json({
            ...booking,
            roomStatus: updatedRoom?.status,
            userRole: updateuserrole?.role,
            roomCapacity: updatedRoom?.capacity
        });
    } catch (error) {
        console.error("Booking creation failed:", error);
        return NextResponse.json(
            { error: "Failed to create booking", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }

}