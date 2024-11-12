import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: { name: true },
    })

    return NextResponse.json(categories.map(category => category.name))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'An error occurred while fetching categories' }, { status: 500 })
  }
}