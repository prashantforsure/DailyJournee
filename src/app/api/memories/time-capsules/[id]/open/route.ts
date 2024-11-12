import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    const timeCapsule = await prisma.timeCapsule.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!timeCapsule) {
      return NextResponse.json({ error: 'Time capsule not found' }, { status: 404 })
    }

    if (new Date(timeCapsule.openDate) > new Date()) {
      return NextResponse.json({ error: 'This time capsule is not ready to be opened yet' }, { status: 400 })
    }

    const newEntry = await prisma.entry.create({
      data: {
        title: timeCapsule.title,
        content: timeCapsule.content,
        userId: session.user.id,  
        journal: { connect: { id: timeCapsule.journalId } },
        isTimeCapsule: true,
      },
    })

    await prisma.timeCapsule.delete({
      where: {
        id,
      },
    })

    return NextResponse.json(newEntry)
  } catch (error) {
    console.error('Error opening time capsule:', error)
    return NextResponse.json({ error: 'An error occurred while opening the time capsule' }, { status: 500 })
  }
}
