import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
};

export function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: corsHeaders,
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, userId, token } = body;
    console.log("Received items:", items);
    console.log("User ID:", userId);
    console.log("Token:", token);

    if (!items || !userId || !token) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user || user.token !== token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    if (user.tokenExpiry && user.tokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 403, headers: corsHeaders }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400, headers: corsHeaders }
      );
    }

    for (const scanned of items) {
      if (!scanned.barcode) {
        return NextResponse.json(
          { error: "Each item must have barcode" },
          { status: 400, headers: corsHeaders }
        );
      }

      const item = await prisma.item.findUnique({
        where: { barcode: scanned.barcode },
      });

      if (!item) {
        return NextResponse.json(
          { error: `Item not found: ${scanned.barcode}` },
          { status: 404, headers: corsHeaders }
        );
      }

      await prisma.scannedItem.create({
        data: {
          userId: user.id,
          itemId: item.id,
          quantity: scanned.count || 1,
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Items saved successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error saving scanned items:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  if (!userId || !token) {
    return NextResponse.json(
      { error: "Missing userId or token" },
      { status: 400, headers: corsHeaders }
    );
  }

  const user = await prisma.user.findUnique({ where: { userId } });

  if (!user || user.token !== token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders }
    );
  }

  if (user.tokenExpiry && user.tokenExpiry < new Date()) {
    return NextResponse.json(
      { error: "Token expired" },
      { status: 403, headers: corsHeaders }
    );
  }

  const scannedItems = await prisma.scannedItem.findMany({
    where: { userId: user.id },
    include: { item: true },
  });

  return NextResponse.json(
    { items: scannedItems },
    { status: 200, headers: corsHeaders }
  );
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Missing userId or token" },
        { status: 400, headers: corsHeaders }
      );
    }

    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user || user.token !== token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    if (user.tokenExpiry && user.tokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 403, headers: corsHeaders }
      );
    }

    await prisma.scannedItem.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error deleting scanned items:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
