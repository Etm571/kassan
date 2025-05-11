import { PrismaClient } from '@/generated/prisma'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const barcode = searchParams.get('barcode')

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode saknas' }, { status: 400 })
  }

  const item = await prisma.item.findUnique({
    where: { barcode },
    select: {
      id: true,
      name: true,
      barcode: true,
      imagePath: true
    }
  })

  if (!item) {
    return NextResponse.json({ error: 'Objekt hittades inte' }, { status: 404 })
  }

  return NextResponse.json(item)
}
