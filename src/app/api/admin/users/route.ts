import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

function generateUserId(): string {
  const min = 1000000000
  const max = 9999999999
  return Math.floor(Math.random() * (max - min + 1) + min).toString()
}

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Alla fält är obligatoriska' }, { status: 400 })
    }

    let userId = ''
    let exists = true

    while (exists) {
      userId = generateUserId()
      const existing = await prisma.user.findUnique({ where: { userId } })
      exists = !!existing
    }

    const user = await prisma.user.create({
      data: { userId, email, name },
    })

    return NextResponse.json(
      {
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internt serverfel' },
      { status: 500 }
    )
  }
}
