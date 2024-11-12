import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

import { startOfYear, endOfYear } from 'date-fns'
import { authOptions } from '@/lib/auth/auth'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

  try {
    const startDate = startOfYear(new Date(year, 0, 1))
    const endDate = endOfYear(new Date(year, 0, 1))

    const entries = await prisma.entry.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    })

    const totalEntries = entries.length

    const moodCounts: { [key: string]: number } = {}
    const categoryCounts: { [key: string]: number } = {}

    entries.forEach((entry) => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
      }
      if (entry.category) {
        categoryCounts[entry.category.name] = (categoryCounts[entry.category.name] || 0) + 1
      }
    })

    const topMoods = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([mood, count]) => ({ mood, count }))

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }))

    const yearlyReview = {
      year,
      totalEntries,
      topMoods,
      topCategories,
    }

    return NextResponse.json(yearlyReview)
  } catch (error) {
    console.error('Error fetching yearly review:', error)
    return NextResponse.json({ error: 'An error occurred while fetching yearly review' }, { status: 500 })
  }
}