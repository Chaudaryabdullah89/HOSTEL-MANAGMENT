import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendmail";

export async function POST(request: NextRequest) {
    try {
        const {
            type, // 'payment_created', 'payment_approved', 'payment_rejected', 'booking_status_update', 'monthly_payment'
            userEmail,
            userName,
            bookingId,
            roomNumber,
            hostelName,
            amount,
            paymentId,
            status,
            notes,
            dueDate,
            previousStatus,
            newStatus,
            reason,
            paymentType,
            staffPosition
        } = await request.json();

        if (!type || !userEmail || !userName) {
            return NextResponse.json(
                { error: "Missing required fields: type, userEmail, userName" },
                { status: 400 }
            );
        }

        let subject = "";
        let html = "";

        switch (type) {
            case 'payment_created':
                subject = `Payment Created - Booking #${bookingId?.slice(-8)} | Sama Hostel`;
                html = generatePaymentCreatedEmail(userName, bookingId, roomNumber, hostelName, amount, paymentId);
                break;

            case 'payment_approved':
                subject = `Payment Approved - Booking #${bookingId?.slice(-8)} | Sama Hostel`;
                html = generatePaymentApprovedEmail(userName, bookingId, roomNumber, hostelName, amount, paymentId);
                break;

            case 'monthly_payment':
                subject = `Monthly Payment Created - Booking #${bookingId?.slice(-8)} | Sama Hostel`;
                html = generateMonthlyPaymentEmail(userName, bookingId, roomNumber, hostelName, amount, dueDate);
                break;

            case 'booking_status_update':
                subject = `Booking Status Update - #${bookingId?.slice(-8)} | Sama Hostel`;
                html = generateBookingStatusUpdateEmail(userName, bookingId, roomNumber, hostelName, previousStatus, newStatus, notes);
                break;

            case 'payment_rejected':
                if (paymentType === 'booking') {
                    subject = `Payment Rejected - Booking #${bookingId?.slice(-8)} | Sama Hostel`;
                    html = generatePaymentRejectedEmail(userName, bookingId, roomNumber, hostelName, amount, paymentId, reason, 'booking');
                } else if (paymentType === 'salary') {
                    subject = `Salary Payment Rejected | Sama Hostel`;
                    html = generatePaymentRejectedEmail(userName, null, null, hostelName, amount, paymentId, reason, 'salary', staffPosition);
                } else {
                    return NextResponse.json(
                        { error: "Invalid payment type for rejection" },
                        { status: 400 }
                    );
                }
                break;

            case 'user_registration':
                subject = `Welcome to Sama Hostel - Account Created`;
                html = generateRegistrationEmail(userName, userEmail, notes); // notes will contain the password
                break;

            case 'user_welcome':
                subject = `Welcome to Sama Hostel - Account Created`;
                html = generateWelcomeEmail(userName, userEmail); // Simple welcome without credentials
                break;

            default:
                return NextResponse.json(
                    { error: "Invalid notification type" },
                    { status: 400 }
                );
        }

        console.log(`Sending ${type} email to:`, userEmail);
        console.log(`Email subject:`, subject);

        // Check if email service is configured
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️ Email service not configured. Skipping email notification.");
            return NextResponse.json({
                message: `${type} notification skipped - email service not configured`,
                skipped: true
            }, { status: 200 });
        }

        const emailResult = await sendEmail({
            to: userEmail,
            subject: subject,
            html: html
        });

        console.log(`Email sent successfully:`, emailResult);

        return NextResponse.json({
            message: `${type} notification email sent successfully`,
            emailResult: emailResult
        }, { status: 200 });

    } catch (error) {
        console.error("Error sending notification email:", error);
        return NextResponse.json(
            { error: "Failed to send notification email" },
            { status: 500 }
        );
    }
}

function generatePaymentCreatedEmail(userName: string, bookingId: string, roomNumber: string, hostelName: string, amount: number, paymentId: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Created - Sama Hostel</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 50%; width: 60px; height: 60px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">💳</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Payment Created</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 400;">Your payment is being processed</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
            
            <!-- Status Message -->
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <div style="display: flex; align-items: center;">
                    <div style="background: #f59e0b; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 14px;">⏳</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #92400e; font-size: 18px; font-weight: 600;">Payment Pending</h3>
                        <p style="margin: 4px 0 0; color: #92400e; font-size: 14px;">Your payment is awaiting approval from our team.</p>
                    </div>
                </div>
            </div>

            <!-- Payment Details Card -->
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0; margin-bottom: 30px; overflow: hidden;">
                <div style="background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600;">Payment Details</h2>
                </div>
                <div style="padding: 20px;">
                    <div style="display: grid; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Booking ID</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace;">#${bookingId?.slice(-8)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Guest Name</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${userName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Hostel</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${hostelName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Room</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">Room ${roomNumber}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Payment ID</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace;">#${paymentId?.slice(-8)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Amount</span>
                            <span style="color: #059669; font-size: 18px; font-weight: 700;">PKR ${amount?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Next Steps -->
            <div style="background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="background: #3b82f6; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 16px;">ℹ️</span>
                    </div>
                    <h3 style="margin: 0; color: #1e40af; font-size: 18px; font-weight: 600;">What Happens Next?</h3>
                </div>
                <ul style="margin: 0; padding-left: 0; list-style: none;">
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Our team will review your payment
                    </li>
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        You'll receive an approval email once processed
                    </li>
                    <li style="display: flex; align-items: center; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Your booking will be confirmed automatically
                    </li>
                </ul>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">Sama Hostel</h3>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Your home away from home</p>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                Thank you for your payment!<br>
                If you have any questions, please contact our support team.
            </p>
        </div>

    </div>
</body>
</html>`;
}

function generatePaymentApprovedEmail(userName: string, bookingId: string, roomNumber: string, hostelName: string, amount: number, paymentId: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Approved - Sama Hostel</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 40px 30px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 50%; width: 60px; height: 60px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">✅</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Payment Approved!</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 400;">Your payment has been processed successfully</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
            
            <!-- Success Message -->
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <div style="display: flex; align-items: center;">
                    <div style="background: #10b981; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 14px;">✓</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #047857; font-size: 18px; font-weight: 600;">Payment Successful</h3>
                        <p style="margin: 4px 0 0; color: #047857; font-size: 14px;">Your payment has been approved and your booking is confirmed.</p>
                    </div>
                </div>
            </div>

            <!-- Payment Details Card -->
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0; margin-bottom: 30px; overflow: hidden;">
                <div style="background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600;">Payment Details</h2>
                </div>
                <div style="padding: 20px;">
                    <div style="display: grid; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Booking ID</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace;">#${bookingId?.slice(-8)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Guest Name</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${userName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Hostel</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${hostelName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Room</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">Room ${roomNumber}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Payment ID</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace;">#${paymentId?.slice(-8)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Amount</span>
                            <span style="color: #059669; font-size: 18px; font-weight: 700;">PKR ${amount?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Next Steps -->
            <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="background: #10b981; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 16px;">✓</span>
                    </div>
                    <h3 style="margin: 0; color: #047857; font-size: 18px; font-weight: 600;">What's Next?</h3>
                </div>
                <ul style="margin: 0; padding-left: 0; list-style: none;">
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #047857; font-size: 14px;">
                        <span style="background: #10b981; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Your booking is now confirmed and active
                    </li>
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #047857; font-size: 14px;">
                        <span style="background: #10b981; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        You can check in on your scheduled date
                    </li>
                    <li style="display: flex; align-items: center; color: #047857; font-size: 14px;">
                        <span style="background: #10b981; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Contact us if you need any assistance
                    </li>
                </ul>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">Sama Hostel</h3>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Your home away from home</p>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                Thank you for your payment!<br>
                If you have any questions, please contact our support team.
            </p>
        </div>

    </div>
</body>
</html>`;
}

function generateMonthlyPaymentEmail(userName: string, bookingId: string, roomNumber: string, hostelName: string, amount: number, dueDate: string) {
    const dueDateFormatted = new Date(dueDate).toLocaleDateString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Payment Due - Sama Hostel</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 30px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 50%; width: 60px; height: 60px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">📅</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Payment Due</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 400;">Your monthly payment is ready</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
            
            <!-- Urgent Message -->
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <div style="display: flex; align-items: center;">
                    <div style="background: #dc2626; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 14px;">⚠️</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #dc2626; font-size: 18px; font-weight: 600;">Payment Required</h3>
                        <p style="margin: 4px 0 0; color: #dc2626; font-size: 14px;">Please make your payment by the due date to avoid late fees.</p>
                    </div>
                </div>
            </div>

            <!-- Payment Details Card -->
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0; margin-bottom: 30px; overflow: hidden;">
                <div style="background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600;">Payment Details</h2>
                </div>
                <div style="padding: 20px;">
                    <div style="display: grid; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Booking ID</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace;">#${bookingId?.slice(-8)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Guest Name</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${userName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Hostel</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${hostelName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Room</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">Room ${roomNumber}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Due Date</span>
                            <span style="color: #dc2626; font-size: 14px; font-weight: 700;">${dueDateFormatted}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Amount</span>
                            <span style="color: #dc2626; font-size: 18px; font-weight: 700;">PKR ${amount?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payment Options -->
            <div style="background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="background: #3b82f6; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 16px;">💳</span>
                    </div>
                    <h3 style="margin: 0; color: #1e40af; font-size: 18px; font-weight: 600;">Payment Options</h3>
                </div>
                <ul style="margin: 0; padding-left: 0; list-style: none;">
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Visit the hostel office to pay in cash
                    </li>
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Use online banking or mobile payment apps
                    </li>
                    <li style="display: flex; align-items: center; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Contact the hostel for other payment methods
                    </li>
                </ul>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">Sama Hostel</h3>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Your home away from home</p>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                Thank you for your continued stay!<br>
                If you have any questions, please contact our support team.
            </p>
        </div>

    </div>
</body>
</html>`;
}

function generateBookingStatusUpdateEmail(userName: string, bookingId: string, roomNumber: string, hostelName: string, previousStatus: string, newStatus: string, notes: string) {
    const statusColors: { [key: string]: string } = {
        'PENDING': '#f59e0b',
        'CONFIRMED': '#3b82f6',
        'CHECKED_IN': '#10b981',
        'CHECKED_OUT': '#6b7280',
        'CANCELLED': '#dc2626'
    };

    const statusMessages: { [key: string]: string } = {
        'PENDING': 'Your booking is pending confirmation',
        'CONFIRMED': 'Your booking has been confirmed',
        'CHECKED_IN': 'You have successfully checked in',
        'CHECKED_OUT': 'You have checked out',
        'CANCELLED': 'Your booking has been cancelled'
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Status Update - Sama Hostel</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${statusColors[newStatus] || '#6b7280'}, ${statusColors[newStatus] || '#4b5563'}); padding: 40px 30px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 50%; width: 60px; height: 60px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">${newStatus === 'CONFIRMED' ? '✅' : newStatus === 'CHECKED_IN' ? '🏨' : newStatus === 'CHECKED_OUT' ? '👋' : newStatus === 'CANCELLED' ? '❌' : '📋'}</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Status Updated</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 400;">${statusMessages[newStatus] || 'Your booking status has been updated'}</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
            
            <!-- Status Change Message -->
            <div style="background: #f0f9ff; border-left: 4px solid ${statusColors[newStatus] || '#6b7280'}; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <div style="display: flex; align-items: center;">
                    <div style="background: ${statusColors[newStatus] || '#6b7280'}; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 14px;">${newStatus === 'CONFIRMED' ? '✓' : newStatus === 'CHECKED_IN' ? '🏨' : newStatus === 'CHECKED_OUT' ? '👋' : newStatus === 'CANCELLED' ? '❌' : '📋'}</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: ${statusColors[newStatus] || '#6b7280'}; font-size: 18px; font-weight: 600;">Status Changed</h3>
                        <p style="margin: 4px 0 0; color: ${statusColors[newStatus] || '#6b7280'}; font-size: 14px;">From ${previousStatus?.toLowerCase()} to ${newStatus?.toLowerCase()}</p>
                    </div>
                </div>
            </div>

            <!-- Booking Details Card -->
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0; margin-bottom: 30px; overflow: hidden;">
                <div style="background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600;">Booking Details</h2>
                </div>
                <div style="padding: 20px;">
                    <div style="display: grid; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Booking ID</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace;">#${bookingId?.slice(-8)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Guest Name</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${userName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Hostel</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${hostelName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Room</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">Room ${roomNumber}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Previous Status</span>
                            <span style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: capitalize;">${previousStatus?.toLowerCase()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">New Status</span>
                            <span style="color: ${statusColors[newStatus] || '#6b7280'}; font-size: 14px; font-weight: 700; text-transform: capitalize;">${newStatus?.toLowerCase()}</span>
                        </div>
                    </div>
                </div>
            </div>

            ${notes ? `
            <!-- Additional Notes -->
            <div style="background: #f9fafb; border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="background: #6b7280; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 14px;">📝</span>
                    </div>
                    <h3 style="margin: 0; color: #374151; font-size: 18px; font-weight: 600;">Additional Notes</h3>
                </div>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">${notes}</p>
            </div>
            ` : ''}

            <!-- Next Steps -->
            <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="background: #10b981; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 16px;">ℹ️</span>
                    </div>
                    <h3 style="margin: 0; color: #047857; font-size: 18px; font-weight: 600;">What's Next?</h3>
                </div>
                <ul style="margin: 0; padding-left: 0; list-style: none;">
                    ${newStatus === 'CONFIRMED' ? '<li style="display: flex; align-items: center; margin-bottom: 8px; color: #047857; font-size: 14px;"><span style="background: #10b981; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>You can now check in on your scheduled date</li>' : ''}
                    ${newStatus === 'CHECKED_IN' ? '<li style="display: flex; align-items: center; margin-bottom: 8px; color: #047857; font-size: 14px;"><span style="background: #10b981; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>Enjoy your stay! Contact reception for any assistance</li>' : ''}
                    ${newStatus === 'CHECKED_OUT' ? '<li style="display: flex; align-items: center; margin-bottom: 8px; color: #047857; font-size: 14px;"><span style="background: #10b981; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>Thank you for staying with us! We hope to see you again</li>' : ''}
                    ${newStatus === 'CANCELLED' ? '<li style="display: flex; align-items: center; margin-bottom: 8px; color: #047857; font-size: 14px;"><span style="background: #10b981; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>If you have any questions about the cancellation, please contact us</li>' : ''}
                    <li style="display: flex; align-items: center; color: #047857; font-size: 14px;">
                        <span style="background: #10b981; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Check your booking status anytime in your account
                    </li>
                </ul>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">Sama Hostel</h3>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Your home away from home</p>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                Thank you for choosing Sama Hostel!<br>
                If you have any questions, please contact our support team.
            </p>
        </div>

    </div>
</body>
</html>`;
}

function generatePaymentRejectedEmail(userName: string, bookingId: string | null, roomNumber: string | null, hostelName: string, amount: number, paymentId: string, reason: string, paymentType: 'booking' | 'salary', staffPosition?: string) {
    const isBookingPayment = paymentType === 'booking';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Rejected - Sama Hostel</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 30px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 50%; width: 60px; height: 60px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">❌</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Payment Rejected</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 400;">${isBookingPayment ? 'Your booking payment has been rejected' : 'Your salary payment has been rejected'}</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
            
            <!-- Rejection Message -->
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <div style="display: flex; align-items: center;">
                    <div style="background: #dc2626; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 14px;">❌</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #dc2626; font-size: 18px; font-weight: 600;">Payment Rejected</h3>
                        <p style="margin: 4px 0 0; color: #dc2626; font-size: 14px;">${isBookingPayment ? 'Your booking payment could not be processed' : 'Your salary payment request has been declined'}</p>
                    </div>
                </div>
            </div>

            <!-- Payment Details Card -->
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0; margin-bottom: 30px; overflow: hidden;">
                <div style="background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600;">${isBookingPayment ? 'Booking Details' : 'Salary Details'}</h2>
                </div>
                <div style="padding: 20px;">
                    <div style="display: grid; gap: 16px;">
                        ${isBookingPayment ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Booking ID</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace;">#${bookingId?.slice(-8)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Room</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">Room ${roomNumber}</span>
                        </div>
                        ` : `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Position</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${staffPosition || 'N/A'}</span>
                        </div>
                        `}
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Name</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${userName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Hostel</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600;">${hostelName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Payment ID</span>
                            <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'Monaco', 'Menlo', monospace;">#${paymentId?.slice(-8)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                            <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Amount</span>
                            <span style="color: #dc2626; font-size: 18px; font-weight: 700;">PKR ${amount?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Rejection Reason -->
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="background: #dc2626; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 14px;">📝</span>
                    </div>
                    <h3 style="margin: 0; color: #dc2626; font-size: 18px; font-weight: 600;">Rejection Reason</h3>
                </div>
                <p style="margin: 0; color: #dc2626; font-size: 14px; line-height: 1.5; background: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #fecaca;">${reason}</p>
            </div>

            <!-- Next Steps -->
            <div style="background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="background: #3b82f6; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 16px;">ℹ️</span>
                    </div>
                    <h3 style="margin: 0; color: #1e40af; font-size: 18px; font-weight: 600;">What's Next?</h3>
                </div>
                <ul style="margin: 0; padding-left: 0; list-style: none;">
                    ${isBookingPayment ? `
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Your booking remains active despite payment rejection
                    </li>
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Please submit a new payment to complete your booking
                    </li>
                    <li style="display: flex; align-items: center; color: #1e40af; font-size: 14px;"    >
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Contact us if you need assistance or have questions
                    </li>
                    ` : `
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Your salary payment request has been declined
                    </li>
                    <li style="display: flex; align-items: center; margin-bottom: 8px; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        Please review the rejection reason and contact HR if needed
                    </li>
                    <li style="display: flex; align-items: center; color: #1e40af; font-size: 14px;">
                        <span style="background: #3b82f6; border-radius: 50%; width: 6px; height: 6px; margin-right: 12px; flex-shrink: 0;"></span>
                        You may submit a new salary request after addressing the issues
                    </li>
                    `}
                </ul>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">Sama Hostel</h3>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Your home away from home</p>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                If you have any questions about this rejection, please contact our support team.<br>
                We're here to help resolve any issues.
            </p>
        </div>

    </div>
</body>
</html>`;
}

// Registration email template for new users created by admin/warden (with credentials)
function generateRegistrationEmail(userName: string, userEmail: string, userPassword: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Sama Hostel - Account Created</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="background: #2c3e50; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to Sama Hostel</h1>
                <p style="margin: 8px 0 0; color: #bdc3c7; font-size: 16px;">Your account has been created successfully</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                
                <!-- Welcome Message -->
                <div style="background: #f8f9fa; border-left: 4px solid #27ae60; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 8px; color: #2c3e50; font-size: 18px; font-weight: 600;">Account Created Successfully</h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Welcome ${userName}! Your account is ready and you can now access our services.</p>
                </div>

                <!-- Login Credentials -->
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 12px; color: #856404; font-size: 16px; font-weight: 600;">Your Login Credentials</h3>
                    <p style="margin: 0 0 16px; color: #856404; font-size: 14px;">Use these details to log into your account</p>
                    <div style="background: #ffffff; border: 1px solid #ffeaa7; padding: 16px;">
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; color: #856404; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Email Address</label>
                            <div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 8px; font-family: monospace; font-size: 14px; color: #2c3e50;">${userEmail}</div>
                        </div>
                        <div>
                            <label style="display: block; color: #856404; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Password</label>
                            <div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 8px; font-family: monospace; font-size: 14px; color: #2c3e50;">${userPassword}</div>
                        </div>
                    </div>
                    <p style="margin: 12px 0 0; color: #856404; font-size: 12px;">Please change your password after first login for security</p>
                </div>

                <!-- Next Steps -->
                <div style="background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 12px; color: #2c3e50; font-size: 16px; font-weight: 600;">What's Next?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #7f8c8d; font-size: 14px;">
                        <li style="margin-bottom: 4px;">Log in to your account using the credentials above</li>
                        <li style="margin-bottom: 4px;">Change your password for security</li>
                        <li style="margin-bottom: 4px;">Complete your profile information</li>
                        <li>Start booking rooms and managing your reservations</li>
                    </ul>
                </div>

                <!-- Security Notice -->
                <div style="background: #e8f4fd; border: 1px solid #b8daff; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 8px; color: #004085; font-size: 16px; font-weight: 600;">Security Notice</h3>
                    <p style="margin: 0; color: #004085; font-size: 14px;">
                        For your security, please change your password immediately after your first login. 
                        Never share your login credentials with anyone.
                    </p>
                </div>

            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                <h3 style="margin: 0 0 8px; color: #2c3e50; font-size: 16px; font-weight: 600;">Sama Hostel</h3>
                <p style="margin: 0; color: #7f8c8d; font-size: 12px;">
                    Welcome to our family!<br>
                    If you have any questions, please contact our support team.
                </p>
            </div>

        </div>
    </body>
    </html>`;
}

// Simple welcome email template for users who sign up via auth/signup (no credentials)
function generateWelcomeEmail(userName: string, userEmail: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Sama Hostel - Account Created</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="background: #2c3e50; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to Sama Hostel</h1>
                <p style="margin: 8px 0 0; color: #bdc3c7; font-size: 16px;">Your account has been created successfully</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                
                <!-- Welcome Message -->
                <div style="background: #f8f9fa; border-left: 4px solid #27ae60; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 8px; color: #2c3e50; font-size: 18px; font-weight: 600;">Account Created Successfully</h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Welcome ${userName}! Your account is ready and you can now access our services.</p>
                </div>

                <!-- Account Details -->
                <div style="background: #ffffff; border: 1px solid #e9ecef; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 12px; color: #2c3e50; font-size: 16px; font-weight: 600;">Your Account</h3>
                    <div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 16px;">
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; color: #6b7280; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Email Address</label>
                            <div style="background: #ffffff; border: 1px solid #dee2e6; padding: 8px; font-family: monospace; font-size: 14px; color: #2c3e50;">${userEmail}</div>
                        </div>
                    </div>
                </div>

                <!-- Next Steps -->
                <div style="background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 12px; color: #2c3e50; font-size: 16px; font-weight: 600;">What's Next?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #7f8c8d; font-size: 14px;">
                        <li style="margin-bottom: 4px;">Log in to your account using your email and password</li>
                        <li style="margin-bottom: 4px;">Complete your profile information</li>
                        <li style="margin-bottom: 4px;">Start booking rooms and managing your reservations</li>
                        <li>Contact us if you need any assistance</li>
                    </ul>
                </div>

                <!-- Features -->
                <div style="background: #e8f4fd; border: 1px solid #b8daff; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 12px; color: #004085; font-size: 16px; font-weight: 600;">What You Can Do</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #004085; font-size: 14px;">
                        <li style="margin-bottom: 4px;">Book rooms for your stay</li>
                        <li style="margin-bottom: 4px;">View your booking history</li>
                        <li style="margin-bottom: 4px;">Manage your payments</li>
                        <li>Update your profile and preferences</li>
                    </ul>
                </div>

            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                <h3 style="margin: 0 0 8px; color: #2c3e50; font-size: 16px; font-weight: 600;">Sama Hostel</h3>
                <p style="margin: 0; color: #7f8c8d; font-size: 12px;">
                    Welcome to our family!<br>
                    If you have any questions, please contact our support team.
                </p>
            </div>

        </div>
    </body>
    </html>`;
}
