import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { userId: BigInt(parseInt(userId)) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "STAFF" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userSafe = {
      ...user,
      userId: user.userId.toString(),
    };

    return NextResponse.json({ user: userSafe }, { status: 200 });
  } catch (error) {
    console.error("Error in auth route:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
