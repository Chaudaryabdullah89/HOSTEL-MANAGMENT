const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMultiplePayments() {
    try {
        console.log('🔍 Fetching active bookings...\n');

        // Get some active bookings
        const bookings = await prisma.booking.findMany({
            where: {
                status: {
                    in: ['CONFIRMED', 'CHECKED_IN']
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                room: {
                    select: {
                        id: true,
                        roomNumber: true,
                        pricePerMonth: true,
                        hostelId: true
                    }
                },
                hostel: {
                    select: {
                        id: true,
                        hostelName: true
                    }
                },
                payment: true
            },
            take: 5 // Take first 5 bookings for testing
        });

        if (bookings.length === 0) {
            console.log('❌ No active bookings found. Please create some bookings first.');
            return;
        }

        console.log(`✅ Found ${bookings.length} active booking(s)\n`);

        const createdPayments = [];

        // For each booking, create 3-5 payments (simulating monthly payments)
        for (const booking of bookings) {
            const numberOfPayments = Math.floor(Math.random() * 3) + 3; // Random 3-5 payments
            const baseAmount = booking.room?.pricePerMonth || 50000;

            console.log(`📝 Creating ${numberOfPayments} payments for booking: ${booking.id}`);
            console.log(`   Guest: ${booking.user?.name}`);
            console.log(`   Room: ${booking.room?.roomNumber}`);
            console.log(`   Hostel: ${booking.hostel?.hostelName}\n`);

            for (let i = 0; i < numberOfPayments; i++) {
                // Create payments with different dates (simulate monthly payments)
                const paymentDate = new Date();
                paymentDate.setMonth(paymentDate.getMonth() - (numberOfPayments - i - 1));

                // Vary the amount slightly for realism
                const amount = i === 0
                    ? baseAmount // First payment full amount
                    : baseAmount * 0.8; // Subsequent payments slightly less

                const paymentStatuses = ['PENDING', 'COMPLETED', 'FAILED'];
                const approvalStatuses = ['APPROVED', 'PENDING'];
                const paymentMethods = ['BANK_TRANSFER', 'CASH', 'CARD', 'ONLINE'];

                const payment = await prisma.payment.create({
                    data: {
                        bookingId: booking.id,
                        userId: booking.userId,
                        hostelId: booking.hostelId,
                        roomId: booking.roomId,
                        amount: amount,
                        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                        status: i < numberOfPayments - 1 ? 'COMPLETED' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
                        approvalStatus: i < numberOfPayments - 1 ? 'APPROVED' : approvalStatuses[Math.floor(Math.random() * approvalStatuses.length)],
                        transactionId: `TEST_TXN_${Date.now()}_${i}`,
                        notes: `Test payment #${i + 1} of ${numberOfPayments} for ${paymentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                        createdAt: paymentDate,
                        type: 'booking'
                    }
                });

                createdPayments.push({
                    id: payment.id,
                    bookingId: booking.id,
                    amount: payment.amount,
                    status: payment.status,
                    month: paymentDate.toLocaleString('default', { month: 'long' })
                });

                console.log(`   ✅ Payment ${i + 1}/${numberOfPayments} created - ₦${amount} (${payment.status})`);
            }
            console.log('');
        }

        console.log('\n🎉 Successfully created multiple test payments!\n');
        console.log(`📊 Summary:`);
        console.log(`   - Bookings processed: ${bookings.length}`);
        console.log(`   - Total payments created: ${createdPayments.length}`);
        console.log(`\n💡 Now visit /dashboard/admin/payments to see the grouped payments UI!\n`);

        // Show some example grouped payments
        const groupedByBooking = createdPayments.reduce((acc, payment) => {
            if (!acc[payment.bookingId]) {
                acc[payment.bookingId] = [];
            }
            acc[payment.bookingId].push(payment);
            return acc;
        }, {});

        console.log('📋 Payment Groups Created:\n');
        Object.entries(groupedByBooking).forEach(([bookingId, payments]) => {
            console.log(`   Booking ${bookingId.slice(-8)}: ${payments.length} payments`);
            const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
            console.log(`   Total Amount: ₦${total.toLocaleString()}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error creating test payments:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createMultiplePayments()
    .then(() => {
        console.log('✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });

