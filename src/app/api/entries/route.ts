// app/api/entries/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const where: any = {
    userId: session.user.id,
    AND: [
      {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      },
    ],
  }

  if (startDate && endDate) {
    where.AND.push({
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    })
  }

  try {
    const entries = await prisma.entry.findMany({
      where,
      include: {
        journal: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}