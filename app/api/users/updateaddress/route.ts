import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check user session
    const session = await getServerSession(request);
  
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Destructure address fields
    const { Adressline1, Adressline2, city, state, country, zipcode } = body;

    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        address: {
          update: {
            street: Adressline1 ?? undefined,
            city: city ?? undefined,
            state: state ?? undefined,
            country: country ?? undefined,
            zipcode: zipcode ?? undefined
          }
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Error updating address:", err);
    return NextResponse.json({ error: err.message || "Failed to update address" }, { status: 500 });
  }
}
