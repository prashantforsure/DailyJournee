import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'

//this is the code to find the journal and the entries 
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const date = searchParams.get('date')

  try {
    const journals = await prisma.journal.findMany({
      where: {
        userId: session.user.id,
        name: q ? { contains: q, mode: 'insensitive' } : undefined,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    })

    const entries = await prisma.entry.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: q ? { contains: q, mode: 'insensitive' } : undefined },
          { content: q ? { contains: q, mode: 'insensitive' } : undefined },
        ],
        createdAt: date ? { gte: new Date(date), lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) } : undefined,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        journal: {
          select: {
            name: true,
          },
        },
      },
    })

    const results = [
      ...journals.map(journal => ({
        id: journal.id,
        title: journal.name,
        createdAt: journal.createdAt.toISOString(),
        type: 'journal' as const,
      })),
      ...entries.map(entry => ({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        createdAt: entry.createdAt.toISOString(),
        type: 'entry' as const,
        journalName: entry.journal.name,
      })),
    ]

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'An error occurred while searching' }, { status: 500 })
  }
}