
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const  entryId  = (await params).entryId

  try {
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { userId: true, isFavorite: true },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedEntry = await prisma.entry.update({
      where: { id: entryId },
      data: { isFavorite: !entry.isFavorite },
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}