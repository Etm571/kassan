import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/app/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items, userId, token } = req.body;

    if (!items || !userId || !token) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user || user.token !== token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.tokenExpiry && user.tokenExpiry < new Date()) {
      return res.status(403).json({ error: "Token expired" });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array" });
    }

    for (const scanned of items) {
      if (!scanned.barcode) {
        return res.status(400).json({ error: "Each item must have barcode" });
      }

      const item = await prisma.item.findUnique({ where: { barcode: scanned.barcode } });

      if (!item) {
        return res.status(404).json({ error: `Item not found: ${scanned.barcode}` });
      }

      await prisma.scannedItem.create({
        data: {
          userId: user.id,
          itemId: item.id,
          quantity: scanned.quantity || 1,
        }
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error saving scanned items:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
