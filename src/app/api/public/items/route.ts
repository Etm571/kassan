import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, ngrok-skip-browser-warning",
      },
    }
  );
}

export async function GET() {
  const items = await prisma.item.findMany({
    orderBy: { id: "desc" },
    select: {
      id: true,
      name: true,
      barcode: true,
      price: true,
      imagePath: true,
      stock: true
    },
  });

  return NextResponse.json(items, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
