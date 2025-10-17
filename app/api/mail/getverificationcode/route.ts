import {  NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendmail";
import { getServerSession } from "@/lib/server-auth";
export async function POST(request: Request) {
    try {
         const {to,subject} = await request.json();
         const session = await getServerSession(request);
         if (!session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
         }
         const userId = session.user.id;
         const verificationCode = Math.floor(Math.random() *10000 + 1000).toString();
         const html = `
           <div style="font-family: Arial, sans-serif; background: #f2f3f8; padding: 32px;">
             <div style="max-width: 520px; background: #fff; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(18,38,63,0.03);">
               <div style="background: #3b82f6; color: #fff; padding: 16px 32px;">
                 <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">Email Verification Code</h2>
               </div>
               <div style="padding: 32px;">
                 <p style="font-size: 16px; color: #292929;">Dear User,</p>
                 <p style="font-size: 16px; color: #292929;">Please use the verification code below to verify your email address:</p>
                 <div style="margin: 28px 0;">
                   <span style="display: inline-block; padding: 14px 38px; background: #eef3fc; color: #3b82f6; font-size: 28px; letter-spacing: 6px; font-weight: bold; border-radius: 8px; border: 1px dashed #a4baf3;">
                     ${verificationCode}
                   </span>
                 </div>
                 <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. Please do not share this code with anyone.</p>
                 <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;">
                 <p style="font-size: 13px; color: #a0aec0;">If you did not request this code, please ignore this email.</p>
                 <p style="font-size: 13px; color: #a0aec0;">Best regards,<br>Sama Hostel Team</p>
               </div>
             </div>
           </div>
         `;
         await prisma.emailChangeRequest.upsert({
             where: { userId: userId },
             update: {
               newEmail: to,
               code: verificationCode,
               expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
             },
             create: {
               userId: userId,   
               newEmail: to,
               code: verificationCode,
               expiresAt: new Date(Date.now() + 10 * 60 * 1000),
             },
           });
         await sendEmail({ to, subject: subject, html: html });

  return NextResponse.json({ message: "Verification code sent successfully" , code: verificationCode }, { status: 200 });
    } catch (error) {
        console.error("Error sending verification code:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}