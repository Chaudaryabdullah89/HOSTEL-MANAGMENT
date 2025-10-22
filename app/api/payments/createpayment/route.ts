import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { googleSheetsService } from "@/lib/googleSheets";


export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(request);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { bookingId, amount, paymentMethod, status, transactionId, notes, roomId, hostelId } = body;

        // Validate required fields
        if (!bookingId || !amount || !paymentMethod || !hostelId) {
            return NextResponse.json(
                { error: "Missing required fields: bookingId, amount, paymentMethod, hostelId" },
                { status: 400 }
            );
        }
        const hostel = await prisma.hostel.findUnique({
            where: { id: hostelId }
        });
        if (!hostel) {
            return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
        }
        if (roomId) {
            const room = await prisma.room.findUnique({
                where: { id: roomId, hostelId: hostelId }
            });
            if (!room) {
                return NextResponse.json({ error: "Room not found" }, { status: 404 });
            }
        }

        // Check if booking exists
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Create payment
        const payment = await prisma.payment.create({
            data: {
                bookingId: bookingId,
                userId: booking.userId,
                hostelId: hostelId,
                roomId: roomId || null,
                amount: Number(amount),
                method: paymentMethod,
                transactionId: transactionId || null,
                notes: notes || null,
                status: status || "PENDING",
                approvalStatus: "PENDING"
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
                        room: {
                            select: {
                                roomNumber: true,
                                id: true,
                                hostel: {
                                    select: {
                                        hostelName: true,
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Add payment to Google Sheets
        try {
            await googleSheetsService.addPayment({
                id: payment.id,
                bookingId: payment.bookingId,
                amount: payment.amount,
                method: payment.method,
                status: payment.status,
                description: payment.notes || 'Payment for booking',
                createdAt: payment.createdAt
            });
        } catch (sheetsError) {
            console.error('Failed to add payment to Google Sheets:', sheetsError);
            // Don't fail the payment creation if Google Sheets fails
        }

        // Payment creation email is now handled by booking confirmation email

        return NextResponse.json(payment, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        );
    }
}