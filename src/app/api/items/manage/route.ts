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
    },
  });

  return NextResponse.json(items, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, name, barcode, price, imagePath } = data;

  if (!id || !name || !barcode) {
    return NextResponse.json(
      { error: "ID, namn och streckkod krävs" },
      {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }

  if (price !== undefined) {
    const priceNumber = Number(price);
    if (
      isNaN(priceNumber) ||
      priceNumber < 0 ||
      !/^\d+(\.\d{1,2})?$/.test(price.toString())
    ) {
      return NextResponse.json(
        { error: "max två decimaler" },
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }
  }

  try {
    const updated = await prisma.item.update({
      where: { id },
      data: {
        name,
        barcode,
        price: price?.toString() ?? undefined,
        imagePath: imagePath ?? undefined,
      },
    });

    return NextResponse.json(
      { success: true, updated },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicerat namn eller streckkod" },
        {
          status: 409,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return NextResponse.json(
      { error: "Kunde inte uppdatera" },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
