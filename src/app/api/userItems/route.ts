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

      await prisma.user.update({
        where: { userId: userId },
        data: { token: null, tokenExpiry: null },
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

  const responseData: any = { items: scannedItems };

  if (!user.spotCheck) {

    const spotCheckProbability = Math.max(0.02, 0.20 - (user.rank * 0.02));
    
    if (true) {
      await prisma.user.update({
        where: { id: user.id },
        data: { spotCheck: true },
      });
      
      const itemsToVerify = [...scannedItems]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          barcode: item.item.barcode,
          name: item.item.name,
          quantity: item.quantity
        }));
      
      responseData.spotCheck = true;
      responseData.spotCheckItems = itemsToVerify;
      responseData.message = "Please verify these random items from your list.";
    }
  } else {
    responseData.spotCheck = true;
    responseData.message = "You still have pending spot check items to verify.";
  }

  return NextResponse.json(responseData, { status: 200, headers: corsHeaders });
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

    const scannedItems = await prisma.scannedItem.findMany({
      where: { userId: user.id },
      select: {
        itemId: true,
        quantity: true,
      },
    });

    await Promise.all(
      scannedItems.map(async ({ itemId, quantity }) => {
        const item = await prisma.item.findUnique({ where: { id: itemId } });
        if (!item) return;

        const newStock = Math.max((item.stock ?? 0) - quantity, 0);

        await prisma.item.update({
          where: { id: itemId },
          data: {
            stock: newStock,
          },
        });
      })
    );

    await prisma.scannedItem.deleteMany({
      where: { userId: user.id },
    });

    await prisma.user.update({
      where: { userId: userId },
      data: { tokenExpiry: null, token: null, active: false },
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

export async function PUT(req: NextRequest) {
  try {
    const { userId, token, passed, verifiedItems } = await req.json();

    if (!userId || !token || typeof passed !== 'boolean' || !Array.isArray(verifiedItems)) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    if (!user.spotCheck) {
      return NextResponse.json(
        { error: "No active spot check" },
        { status: 400, headers: corsHeaders }
      );
    }

    let rankChange = 0;
    if (passed) {
      rankChange = user.rank < 10 ? 1 : 0;
    } else {
      rankChange = user.rank > 1 ? -1 : 0;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        rank: user.rank + rankChange,
        spotCheck: false 
      },
    });

    return NextResponse.json(
      { 
        message: `Spot check ${passed ? 'passed' : 'failed'}. Rank ${rankChange >= 0 ? 'increased' : 'decreased'}.`,
        newRank: updatedUser.rank 
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error processing spot check:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}