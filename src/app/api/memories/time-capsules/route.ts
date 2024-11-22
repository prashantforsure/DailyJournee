import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'


export async function GET() {
  
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, 
    { status: 401 }
    )
  }

  try {
    const timeCapsules = await prisma.timeCapsule.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        openDate: 'asc',
      },
    })

    return NextResponse.json(timeCapsules)
  } catch (error) {
    console.error('Error fetching time capsules:', error)
    return NextResponse.json({ error: 'An error occurred while fetching time capsules' }, 
      { status: 500 }
    )
  }
}


export async function POST(req: Request) {

  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, openDate, journalId } = await req.json()

  try {
    const newTimeCapsule = await prisma.timeCapsule.create({
      data: {
        title,
        content,
        openDate: new Date(openDate),
        user: { connect: { id: session.user.id } },
        journal: { connect: { id: journalId } },
      },
    })

    return NextResponse.json(newTimeCapsule)
  } catch (error) {
    console.error('Error creating time capsule:', error)
    return NextResponse.json({ error: 'An error occurred while creating the time capsule' }, 
      { status: 500 })
  }
  
}