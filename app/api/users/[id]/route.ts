import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/server-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: "ERROR : UNAUTHORIZED" }, { status: 401 })
    }

    const { id: userId } = await params
    if (!userId) {
      return NextResponse.json({ error: "ERROR : USER ID IS REQUIRED" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
 
    })
    if (!user) {
      return NextResponse.json({ error: "ERROR : USER NOT FOUND" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("ERROR : ", error)
    return NextResponse.json({ error: "ERROR : INTERNAL SERVER ERROR" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: "ERROR : UNAUTHORIZED" }, { status: 401 })
    }

    const { id: userId } = await params
    if (!userId) {
      return NextResponse.json({ error: "ERROR : USER ID IS REQUIRED" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "ERROR : USER NOT FOUND" }, { status: 404 })
    }

    const { name, phone } = await request.json()
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone },
    })

    return NextResponse.json({ message: "USER UPDATED SUCCESSFULLY", user: updatedUser }, { status: 200 })
  } catch (error) {
    console.error("ERROR : ", error)
    return NextResponse.json({ error: "ERROR : INTERNAL SERVER ERROR" }, { status: 500 })
  }
}