import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

import { startOfYear, endOfYear, subYears } from 'date-fns'
import { authOptions } from '@/lib/auth/auth'

//this is the api to get the memories 
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

    const memories = await prisma.entry.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    const today = new Date()
    const previousYearsMemories = await Promise.all(
      Array.from({ length: 5 }, (_, i) => i + 1).map(async (yearsAgo) => {
        const targetDate = subYears(today, yearsAgo)
        return prisma.entry.findMany({
          where: {
            userId: session.user.id,
            createdAt: {
              gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
              lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
            },
          },
          include: {
            category: true,
          },
        })
      })
    )

    const allMemories = [...memories, ...previousYearsMemories.flat()]

    return NextResponse.json(allMemories)
  } catch (error) {
    console.error('Error fetching memories:', error)
    return NextResponse.json({ error: 'An error occurred while fetching memories' }, { status: 500 })
  }
}