import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth/auth'

//this is the code to get all the entries in the journal
export async function GET(req: Request) {

  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const where: any = {
    userId: user.id,  
    AND: [
      {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      },
    ],
  }

  console.log('Query where clause:', where)
  console.log('User ID:', user.id)

  if (startDate && endDate) {
    where.AND.push({
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    })
  }

  try {
    const [entries, totalCount] = await Promise.all([
      prisma.entry.findMany({
        where,
        include: {
          journal: true,
          category: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.entry.count({ where }),
    ])

    console.log('Found entries count:', entries.length)
    console.log('Entries user IDs:', entries.map(e => e.userId))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      entries,
      currentPage: page,
      totalPages,
      totalCount,
    })
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}