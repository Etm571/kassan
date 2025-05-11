import { PrismaClient } from '@/generated/prisma'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { name, barcode, imagePath } = data

  if (!name || !barcode) {
    return NextResponse.json({ error: 'Namn och streckkod krävs' }, { status: 400 })
  }

  try {
    const newItem = await prisma.item.create({
      data: {
        name,
        barcode,
        imagePath: imagePath || null
      }
    })

    return NextResponse.json({ success: true, id: newItem.id })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicerat namn eller streckkod' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 })
  }
}

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
