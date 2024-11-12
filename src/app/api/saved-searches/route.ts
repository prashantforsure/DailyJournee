import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'


export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json(savedSearches)
  } catch (error) {
    console.error('Error fetching saved searches:', error)
    return NextResponse.json({ error: 'An error occurred while fetching saved searches' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, query } = await req.json()

  try {
    const savedSearch = await prisma.savedSearch.create({
      data: {
        name,
        query,
        userId: session.user.id,
      },
    })

    return NextResponse.json(savedSearch)
  } catch (error) {
    console.error('Error saving search:', error)
    return NextResponse.json({ error: 'An error occurred while saving the search' }, { status: 500 })
  }
}