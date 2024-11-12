import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const mood = searchParams.get('mood')
  const category = searchParams.get('category')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  try {
    const entries = await prisma.journalEntry.findMany({
      where: {
        AND: [
          q ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          } : {},
          startDate ? { createdAt: { gte: new Date(startDate) } } : {},
          endDate ? { createdAt: { lte: new Date(endDate) } } : {},
          mood ? { mood } : {},
          category ? { category: { name: category } } : {},
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'An error occurred while searching' }, { status: 500 })
  }
}