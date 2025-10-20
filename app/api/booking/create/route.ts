import { NextRequest, NextResponse } from "next/server";
import { BookingType, BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth"
import { updateRoomStatusBasedOnCapacity, isRoomAvailableForBooking, updateAllRoomStatuses } from "@/lib/room-utils";

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

        const booking = await prisma.booking.create({
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
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true,
                        floors: true,
                        amenities: true,
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionId: true,
                        notes: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                }
            },


        });

        await updateRoomStatusBasedOnCapacity(roomId);
        await updateAllRoomStatuses();

        // Return updated room data along with booking
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
            roomCapacity: updatedRoom?.capacity
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        )
    }

}