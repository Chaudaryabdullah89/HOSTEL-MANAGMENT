import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session.loggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {currentPassword, newPassword, confirmPassword} = body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user?.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });
    return NextResponse.json({ message: "Password updated successfully"  ,updatedUser: updatedUser }, { status: 200 });
  }
  catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
  }
}