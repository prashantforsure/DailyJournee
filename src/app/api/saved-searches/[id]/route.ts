import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    await prisma.savedSearch.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Saved search deleted successfully' })
  } catch (error) {
    console.error('Error deleting saved search:', error)
    return NextResponse.json({ error: 'An error occurred while deleting the saved search' }, { status: 500 })
  }
}