import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; // assumes Prisma is setup in /lib/prisma.js

export async function GET() {
  try {
    // Fetch all wardens with their user information
    const wardens = await prisma.warden.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        hostel: {
          select: {
            id: true,
            hostelName: true
          }
        }
      },
      orderBy: {
        user: {
          name: "asc"
        }
      }
    });
    // console.log("WARDENS ", wardens);÷
    const transformedWardens = wardens.map(warden => ({
      id: warden.id,
      name: warden.user.name,
      email: warden.user.email,
      userId: warden.user.id,
      hostelId: warden.hostelId,
      hostelName: warden.hostel.hostelName
    }));
 

    return NextResponse.json(transformedWardens || []);
  } catch (error) {
    console.error("Error fetching wardens:", error);
    return NextResponse.json({ error: "Failed to fetch wardens" }, { status: 500 });
  }
}
