import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendmail";

export async function POST(request: NextRequest) {
    try {
        const {
            userEmail,
            userName,
            bookingId,
            roomNumber,
            hostelName,
            checkin,
            checkout,
            totalAmount,
            bookingType,
            isNewUser = false,
            userCredentials = null
        } = await request.json();

        if (!userEmail || !userName || !bookingId) {
            return NextResponse.json(
                { error: "Missing required fields: userEmail, userName, bookingId" },
                { status: 400 }
            );
        }

        const checkinDate = new Date(checkin).toLocaleDateString();
        const checkoutDate = new Date(checkout).toLocaleDateString();

        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Booking Confirmed | Sama Hostel</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  /* Reset and base styles */
  body {
    margin:0; padding:0;
    background:#fafbfc;
    font-family: 'Segoe UI', 'Roboto', Arial, Helvetica, sans-serif;
    color:#18304b; font-size:15px;
    line-height:1.52;
  }
  .slim-main {
    max-width:600px;
    background:#fff;
    border-radius:7px;
    margin:32px auto 16px;
    box-shadow:0 1.5px 9px 0 rgba(8,31,70,0.08);
    border:1px solid #f2f3f9;
    overflow: hidden;
  }
  .slim-header {
    background:linear-gradient(90deg,#234ca6 80%,#347dcb 100%);
    padding:16px 26px 11px;
    text-align:center;
  }
  .slim-header h1 {
    margin:0;
    color:#fff;
    font-size:23px;
    font-weight:700;
    letter-spacing:0.1px;
  }
  .slim-header p {
    margin:6px 0 0 0;
    color:#e7eeff;
    font-size:14px;
    font-weight:400;
    letter-spacing:.06em;
  }
  .slim-section {
    padding:18px 26px;
    border-bottom:1px solid #f1f4fa;
    background: #fff;
  }
  .slim-section:last-child { border-bottom: none; }
  .slim-titlebar {
    background:#f7f9fd;
    color:#0859ae;
    font-size:14px;
    font-weight:600;
    letter-spacing:.01em;
    padding:11px 26px 11px;
    border-bottom:1px solid #e7eef9;
  }
  .slim-details-list {
    list-style:none; margin:0; padding:0;
  }
  .slim-detail-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:6px 0;
  }
  .slim-label {
    color:#6e819a; font-size:13px;
    font-weight:400;
    letter-spacing:0.02em;
    min-width:89px;
  }
  .slim-value {
    color:#1b3357;
    font-weight:600;
    font-size:13.1px;
    word-break:break-all;
    text-align:right;
  }
  .slim-amt {
    color:#15813a;
    font-size:15px;
    font-weight:700;
    letter-spacing:.01em;
  }
  .slim-badge-success {
    display:inline-flex; align-items:center; gap:6px;
    background: #e6f8ec;
    color: #247e47;
    padding:6px 12px;
    border-radius:4px;
    font-size:13.2px;
    font-weight: 500;
    margin-bottom:5px;
    margin-top:2px;
  }
  .slim-infobox {
    background: #eaf4ff;
    border-left:4px solid #1b6bec;
    padding:13px 13px 10px 13px;
    border-radius:4px;
    font-size:13.2px;
    color:#215595;
    margin:10px 0 13px 0;
  }
  .slim-warnbox {
    background:#fff9e7;
    border-left:4px solid #ffd500;
    color:#a57b10;
    border-radius:4px; padding:12px 13px 9px 13px;
    margin-bottom:12px;
    font-size:13.1px;
  }
  .slim-step-list { 
    margin:0 0 5px 22px; 
    color: #34425a; 
    font-size:13px; 
    padding:0; 
    line-height:1.7;
  }
  .slim-footer {
    background:#f6f8fb;
    text-align:center;
    padding:19px 10px 13px;
    font-size:12.7px;
    color:#8a97ac;
    border-top:1px solid #e3e8f0;
  }
  .slim-account {
    background:#f8f7ec;
    border-radius:4px;
    padding:11px 12px 10px 12px;
    margin-bottom:9px;
    border-left:3px solid #f3d450;
    color:#866700;
    font-size:13.3px;
  }
  .slim-creds {
    background:#f7f9fd;
    border:1px solid #e6e8ea;
    border-radius:5px;
    padding:9px 9px 7px 9px;
    margin-bottom:4px;
  }
  .slim-creds label {
    font-size:11px;
    color:#6a5e2c;
    font-weight:500;
    margin-bottom:2px; display:block;
    margin-top:5px;
  }
  .slim-creds .cred-value {
    font-family:monospace;
    color:#014186;
    padding:5px 6px;
    border-radius:3px;
    background:#fff;
    border:1px solid #ebd57f;
    font-size:12.5px;
    display: inline-block;
    min-width: 60px;
  }
  a.slim-link {
    color:#2147a9; text-decoration: underline; font-size:13px;
  }
  @media (max-width:600px) {
    .slim-main { max-width:99vw; border-radius:0; margin:0; }
    .slim-header, .slim-section, .slim-titlebar { padding-left:5vw; padding-right:5vw; }
    .slim-section { padding-top:16px; padding-bottom:16px; }
    .slim-titlebar, .slim-footer, .slim-header {padding-left:5vw; padding-right:5vw;}
  }
</style>
</head>
<body>
  <div class="slim-main">
    <div class="slim-header">
      <h1>Booking Confirmed</h1>
      <p>Your stay awaits at Sama Hostel</p>
    </div>

    <div class="slim-section" style="background:#fbfefc;padding-top:14px;padding-bottom:10px;">
      <div class="slim-badge-success">
        <img src="https://img.icons8.com/color/36/000000/checkmark.png" width="18" height="18" style="vertical-align:middle;border-radius:50%;" alt="Success"/>
        Reservation Secured
      </div>
      <div class="slim-infobox">
        We have received and approved your booking.
      </div>
    </div>

    <div class="slim-titlebar">Booking Details</div>
    <div class="slim-section" style="padding-bottom:9px;">
      <ul class="slim-details-list">
        <li class="slim-detail-row">
          <span class="slim-label">Booking #</span>
          <span class="slim-value">#${bookingId.slice(-8)}</span>
        </li>
        <li class="slim-detail-row">
          <span class="slim-label">Guest</span>
          <span class="slim-value">${userName}</span>
        </li>
        <li class="slim-detail-row">
          <span class="slim-label">Hostel</span>
          <span class="slim-value">${hostelName}</span>
        </li>
        <li class="slim-detail-row">
          <span class="slim-label">Room</span>
          <span class="slim-value">${roomNumber ? `Room ${roomNumber}` : '-'}</span>
        </li>
        <li class="slim-detail-row">
          <span class="slim-label">Check-in</span>
          <span class="slim-value">${checkinDate}</span>
        </li>
        <li class="slim-detail-row">
          <span class="slim-label">Check-out</span>
          <span class="slim-value">${checkoutDate}</span>
        </li>
        <li class="slim-detail-row">
          <span class="slim-label">Type</span>
          <span class="slim-value" style="text-transform:capitalize;">${bookingType}</span>
        </li>
        <li class="slim-detail-row">
          <span class="slim-label">Total</span>
          <span class="slim-amt">PKR ${totalAmount?.toLocaleString() || '0'}</span>
        </li>
      </ul>
    </div>

    <div class="slim-titlebar">Payment</div>
    <div class="slim-section" style="padding-bottom:13px;">
      <div class="slim-infobox" style="background:#eaf7fe;border-left-color:#2397e2;color:#1863a5;">
        Please complete your payment soon to keep your reservation active.
      </div>
      <ul class="slim-details-list" style="margin-bottom:10px;">
        <li class="slim-detail-row">
          <span class="slim-label">Amount Due</span>
          <span class="slim-amt" style="color:#e3263b;">PKR ${totalAmount?.toLocaleString() || '0'}</span>
        </li>
        <li class="slim-detail-row">
          <span class="slim-label">Status</span>
          <span class="slim-value" style="color:#d78500">Pending</span>
        </li>
        <li class="slim-detail-row">
          <span class="slim-label">Method</span>
          <span class="slim-value">Confirm at hostel</span>
        </li>
      </ul>
      <div style="margin-top:6px;">
        <span style="display:block;font-size:13.1px;color:#306ba9;margin-bottom:6px;font-weight:500;">How to Pay</span>
        <ol class="slim-step-list">
          <li>Pay at the hostel reception (cash or card)</li>
          <li>Ask for bank transfer details</li>
          <li>Contact hostel team for payment support</li>
        </ol>
      </div>
    </div>


    ${isNewUser && userCredentials ? `
      <div class="slim-titlebar">Your Account</div>
      <div class="slim-section">
        <div class="slim-account">
          Welcome! Your account is ready to use.
          <br>
          <a class="slim-link" href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin">Log in to your account</a>
        </div>
        <div class="slim-creds">
          <label>Email</label>
          <span class="cred-value">${userCredentials.email}</span>
          <label>Password</label>
          <span class="cred-value">${userCredentials.password}</span>
        </div>
        <div style="font-size:11.8px;color:#b4901b;margin:6px 2px 0 2px;">
          Please change your password after your first login for security.
        </div>
      </div>
    ` : ''}

    <div class="slim-titlebar">Next Steps</div>
    <div class="slim-section" style="padding-bottom:14px;">
      <ul class="slim-step-list" style="margin-left:16px;">
        <li>Arrive at Sama Hostel on your check-in day</li>
        <li>Bring your ID for check-in</li>
        <li>Reach out with any questions</li>
        <li>View your booking details on your account</li>
      </ul>
    </div>
    <div class="slim-footer">
      Thank you for booking with Sama Hostel.<br>
      Questions? Reply to this email for support.<br>
      &copy; ${new Date().getFullYear()} Sama Hostel
    </div>
  </div>
</body>
</html>
`;



        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️ Email service not configured. Skipping booking confirmation email.");
            return NextResponse.json({
                message: "Booking confirmation email skipped - email service not configured",
                skipped: true
            }, { status: 200 });
        }

        await sendEmail({
            to: userEmail,
            subject: `Booking Confirmation - #${bookingId.slice(-8)} | Sama Hostel`,
            html: html
        });

        return NextResponse.json({
            message: "Booking confirmation email sent successfully"
        }, { status: 200 });

    } catch (error) {
        console.error("Error sending booking confirmation email:", error);
        return NextResponse.json(
            { error: "Failed to send booking confirmation email" },
            { status: 500 }
        );
    }
}
