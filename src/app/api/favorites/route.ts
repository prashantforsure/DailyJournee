import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';

import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth/auth';

const validSortFields = ['createdAt', 'updatedAt', 'title'] as const;
type SortField = typeof validSortFields[number];

const validSortOrders = ['asc', 'desc'] as const;
type SortOrder = typeof validSortOrders[number];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = (searchParams.get('order') || 'desc').toLowerCase();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const search = searchParams.get('search') || '';

  if (!validSortFields.includes(sortBy as SortField)) {
    return new NextResponse("Invalid sort field", { status: 400 });
  }
  if (!validSortOrders.includes(order as SortOrder)) {
    return new NextResponse("Invalid sort order", { status: 400 });
  }

  try {

    const userJournals = await prisma.journal.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true
      }
    });

    const journalIds = userJournals.map(journal => journal.id);

    const where: Prisma.EntryWhereInput = {
      journalId: {
        in: journalIds
      },
      isFavorite: true,
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode
            }
          },
          {
            content: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode
            }
          }
        ]
      })
    };

    const [favorites, totalCount] = await Promise.all([
      prisma.entry.findMany({
        where,
        orderBy: {
          [sortBy]: order
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
          journalId: true,
        },
      }),
      prisma.entry.count({ where }),
    ]);

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