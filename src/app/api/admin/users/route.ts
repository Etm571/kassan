import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

function generateUserId(): string {
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "All fields are mandatory." },
        { status: 400 }
      );
    }

    let userId = "";
    let exists = true;

    while (exists) {
      userId = generateUserId();
      const existing = await prisma.user.findUnique({ where: { userId } });
      exists = !!existing;
    }

    const user = await prisma.user.create({
      data: { userId, email, name },
    });

    return NextResponse.json(
      {
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request): Promise<Response> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request): Promise<Response> {
  try {
    const { id, email, name, role } = await req.json();

    if (!id || !email || !name) {
      return NextResponse.json(
        { error: "All fields are mandatory." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { email, name, role },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
