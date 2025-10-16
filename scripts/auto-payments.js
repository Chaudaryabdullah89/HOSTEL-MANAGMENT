
const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3003';
const API_ENDPOINT = '/api/payments/auto-create';

// Function to make HTTP request
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;
        
        const req = client.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Main function
async function createAutoPayments() {
    const currentDate = new Date();
    console.log(`\n🚀 Starting automated payment creation for ${currentDate.toLocaleDateString()}`);
    console.log(`📅 Current time: ${currentDate.toLocaleString()}`);
    
    try {
        const url = `${API_BASE_URL}${API_ENDPOINT}`;
        console.log(`🌐 Making request to: ${url}`);
        
        const response = await makeRequest(url);
        
        if (response.status === 200) {
            const result = response.data;
            console.log('\n✅ Automated payment creation completed successfully!');
            console.log(`📊 Summary:`);
            console.log(`   • Total active bookings: ${result.summary.totalActiveBookings}`);
            console.log(`   • Payments created: ${result.summary.paymentsCreated}`);
            console.log(`   • Bookings skipped: ${result.summary.bookingsSkipped}`);
            
            if (result.createdPayments.length > 0) {
                console.log('\n💰 Created payments:');
                result.createdPayments.forEach((payment, index) => {
                    console.log(`   ${index + 1}. ${payment.guestName} - Room ${payment.roomNumber} - PKR${payment.amount} (${payment.bookingType})`);
                });
            }
            
            if (result.skippedBookings.length > 0) {
                console.log('\n⏭️  Skipped bookings:');
                result.skippedBookings.forEach((booking, index) => {
                    console.log(`   ${index + 1}. Booking ${booking.bookingId} - ${booking.reason}`);
                });
            }
            
            console.log('\n🎉 Process completed successfully!');
        } else {
            console.error('\n❌ Error creating automated payments:');
            console.error(`   Status: ${response.status}`);
            console.error(`   Error: ${response.data.error || 'Unknown error'}`);
            process.exit(1);
        }
    } catch (error) {
        console.error('\n💥 Fatal error during automated payment creation:');
        console.error(`   Error: ${error.message}`);
        process.exit(1);
    }
}

// Check if this is the 1st of the month (optional validation)
function isFirstOfMonth() {
    const today = new Date();
    return today.getDate() === 1;
}

// Main execution
if (require.main === module) {
    // Optional: Check if it's the 1st of the month
    if (!isFirstOfMonth()) {
        console.log('⚠️  Warning: This script is typically run on the 1st of each month.');
        console.log('   Current date:', new Date().toLocaleDateString());
        console.log('   Continue anyway? (This is just a warning)');
    }
    
    createAutoPayments()
        .then(() => {
            console.log('\n✨ Script execution completed.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Script execution failed:', error);
            process.exit(1);
        });
}

module.exports = { createAutoPayments };
