import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }

) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

const journalId = (await params).journalId
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  if (!year || !month) {
    return new NextResponse("Year and month are required", { status: 400 });
  }

  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0);

  try {
    const entries = await prisma.entry.findMany({
      where: {
        journalId: journalId,
        journal: {
          userId: session.user.id
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        mood: true,
        createdAt: true,
        isQuickEntry: true,
        isFavorite: true,
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching calendar entries:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}