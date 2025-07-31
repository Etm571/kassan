import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, active } = body;

    if (!userId || typeof active !== "boolean") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { userId: Number(userId) } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { userId: Number(userId) },
      data: { active },
    });

    return NextResponse.json({ status: "User updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating user active status:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}