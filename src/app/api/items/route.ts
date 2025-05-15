import { PrismaClient } from '@/generated/prisma'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, ngrok-skip-browser-warning'
    }
  })
}

function isValidPrice(price: any) {
  if (typeof price === 'number') {
    return Number.isFinite(price) && /^\d+(\.\d{1,2})?$/.test(price.toString())
  }
  if (typeof price === 'string') {
    return /^\d+(\.\d{1,2})?$/.test(price)
  }
  return false
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { name, barcode, imagePath, price } = data

  if (!name || !barcode) {
    return NextResponse.json({ error: 'Namn och streckkod krävs' }, {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }

  if (!price || !isValidPrice(price)) {
    return NextResponse.json({ error: 'Ogiltigt pris. Max två decimaler tillåts.' }, {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }

  const priceNum = typeof price === 'string' ? parseFloat(price) : price

  try {
    const newItem = await prisma.item.create({
      data: {
        name,
        barcode,
        imagePath: imagePath || null,
        price: priceNum
      }
    })

    return NextResponse.json({ success: true, id: newItem.id }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicerat namn eller streckkod' }, {
        status: 409,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }

    return NextResponse.json({ error: 'Något gick fel' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const barcode = searchParams.get('barcode')

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode saknas' }, {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }

  const item = await prisma.item.findUnique({
    where: { barcode },
    select: {
      id: true,
      name: true,
      barcode: true,
      price: true,
      imagePath: true
    }
  })

  if (!item) {
    return NextResponse.json({ error: 'Objekt hittades inte' }, {
      status: 404,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }

  return NextResponse.json(item, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  })
}
