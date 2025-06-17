import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = (await context.params);

  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const body = await req.json();
    const delta = body?.delta;

    if (typeof delta !== "number") {
      return NextResponse.json({ error: "Missing or invalid `delta`" }, { status: 400 });
    }

    const updated = await prisma.item.update({
      where: { id: parsedId },
      data: {
        stock: {
          increment: delta,
        },
      },
      select: { id: true, name: true, stock: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock", details: `${error}` },
      { status: 500 }
    );
  }
}
