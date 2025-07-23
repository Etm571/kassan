import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

function generateUserId(): number {
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(Math.random() * (max - min + 1) + min);
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

    let userId = 0;
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
    id: user.id.toString(),
    userId: user.userId.toString(),
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
        suspended: true,
      },
    });

    const serializedUsers = users.map((user) => ({
      ...user,
      id: user.id.toString(),
      userId: user.userId?.toString(),
    }));

    return NextResponse.json(serializedUsers, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { id } = body;

    if (typeof id === 'undefined') {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};

    if ('email' in body && 'name' in body && 'role' in body) {
      const { email, name, role } = body;
      if (!email || !name) {
        return NextResponse.json(
          { error: "Email and name are required when updating user info." },
          { status: 400 }
        );
      }
      dataToUpdate.email = email;
      dataToUpdate.name = name;
      dataToUpdate.role = role;
    }

    if ('suspended' in body) {
      dataToUpdate.suspended = body.suspended;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        role: true,
        suspended: true,
      },
    });

    const serializedUser = {
      ...user,
      id: user.id.toString(),
      userId: user.userId?.toString(),
    };

    const message =
      'suspended' in body
        ? user.suspended
          ? "User suspended successfully"
          : "User unsuspended successfully"
        : "User updated successfully";

    return NextResponse.json({ success: true, user: serializedUser, message }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { id } = body;
    console.log("Deleting user with ID:", id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid user ID." },
        { status: 400 }
      );
    }

    const idInt = parseInt(id, 10);

    const existingUser = await prisma.user.findUnique({
      where: { id: idInt },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id: idInt },
    });

    return NextResponse.json(
      { success: true, message: "User deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
