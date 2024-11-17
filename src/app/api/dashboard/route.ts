
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"

import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth/auth'


export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const userId = session.user.id

    const [totalJournals, totalEntries, recentJournals, recentEntries] = await Promise.all([
      prisma.journal.count({ where: { userId } }),
      prisma.entry.count({ where: { journal: { userId } } }),
      prisma.journal.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { entries: { select: { id: true } } }
      }),
      prisma.entry.findMany({
        where: { journal: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { journal: { select: { name: true } } }
      })
    ])

    // Calculate streak (simplified version)
    const currentStreak = await calculateStreak(userId)

    return NextResponse.json({
      totalJournals,
      totalEntries,
      currentStreak,
      recentJournals: recentJournals.map(journal => ({
        ...journal,
        entryCount: journal.entries.length
      })),
      recentEntries: recentEntries.map(entry => ({
        id: entry.id,
        title: entry.title,
        createdAt: entry.createdAt,
        journalName: entry.journal.name
      }))
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

async function calculateStreak(userId: string): Promise<number> {
  const now = new Date()
  
  const entries = await prisma.entry.findMany({
    where: { journal: { userId } },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  })

  if (entries.length === 0) return 0

  const mostRecentEntry = new Date(entries[0].createdAt)
    const hoursSinceLastEntry = (now.getTime() - mostRecentEntry.getTime()) / (1000 * 60 * 60)
  
  if (hoursSinceLastEntry > 48) {
    return 0
  }
      let streak = 1 
  let currentDate = new Date(mostRecentEntry)
  currentDate.setHours(0, 0, 0, 0)

  for (let i = 1; i < entries.length; i++) {
        const entryDate = new Date(entries[i].createdAt)
     entryDate.setHours(0, 0, 0, 0)
    
    const previousDate = new Date(currentDate)
       previousDate.setDate(previousDate.getDate() - 1)
  
    if (entryDate.getTime() === previousDate.getTime()) {
      streak++
      currentDate = entryDate
    } 
    else if (entryDate.getTime() < previousDate.getTime()) {
  break
    }
    
    else if (entryDate.getTime() === currentDate.getTime()) {
         continue
    }
  }

  return streak
}