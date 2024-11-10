// app/api/journals/[journalId]/favorites/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { journalId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { journalId } = params;
  const { searchParams } = new URL(req.url);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const favorites = await prisma.entry.findMany({
      where: {
        journalId: journalId,
        userId: session.user.id,
        isFavorite: true,
      },
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        mood: true,
        createdAt: true,
        updatedAt: true,
        isQuickEntry: true,
      },
    });

    const totalCount = await prisma.entry.count({
      where: {
        journalId: journalId,
        userId: session.user.id,
        isFavorite: true,
      },
    });

    return NextResponse.json({
      favorites,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching favorite entries:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { journalId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { journalId } = params;
  const { entryId, isFavorite } = await req.json();

  try {
    const updatedEntry = await prisma.entry.update({
      where: {
        id: entryId,
        journalId: journalId,
        userId: session.user.id,
      },
      data: {
        isFavorite: isFavorite,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating favorite status:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}