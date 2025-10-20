import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendmail";

export async function POST(request: NextRequest) {
    try {
        const { to, subject, message } = await request.json();

        if (!to || !subject || !message) {
            return NextResponse.json(
                { error: "Missing required fields: to, subject, message" },
                { status: 400 }
            );
        }

        console.log("Testing email service...");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("Message:", message);

        const html = `
      <div style="font-family: Arial, sans-serif; background: #f2f3f8; padding: 32px;">
        <div style="max-width: 600px; background: #fff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; padding: 24px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Email Test</h1>
            <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">Testing email service configuration</p>
          </div>
          
          <div style="padding: 32px;">
            <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px;">Test Message</h2>
              <p style="margin: 0; color: #1e293b; font-size: 16px;">${message}</p>
            </div>

            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; color: #047857; font-size: 18px;">✅ Email Service Working</h3>
              <p style="margin: 0; color: #047857; font-size: 14px;">If you received this email, the email service is properly configured and working!</p>
            </div>

            <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                Sama Hostel Email Service Test<br>
                <strong style="color: #1e293b;">System Administrator</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

        const result = await sendEmail({
            to: to,
            subject: subject,
            html: html
        });

        console.log("Email test result:", result);

        return NextResponse.json({
            success: true,
            message: "Test email sent successfully",
            result: result
        }, { status: 200 });

    } catch (error) {
        console.error("Email test failed:", error);
        return NextResponse.json(
            {
                error: "Email test failed",
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
