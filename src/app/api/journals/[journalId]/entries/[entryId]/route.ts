import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';

export async function GET(
  req: NextRequest,
  
  { params }: { params: Promise<{ journalId: string; entryId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const  entryId  = (await params).entryId
  const journalId = (await params).journalId

  try {
    
    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        journalId: journalId,
        journal: {
          userId: session.user.id
        }
      },
      include: {
        tags: true,
        media: true,
        category: true,
      },
    });

    if (!entry) {
      return new NextResponse("Entry not found", { status: 404 });
    }

    const relatedEntries = await prisma.entry.findMany({
      where: {
        journalId: journalId,
        journal: {
          userId: session.user.id
        },
        id: { not: entryId },
        AND: [
          {
            tags: {
              some: {
                id: {
                  in: entry.tags.map(tag => tag.id)
                }
              }
            }
          }
        ]
      },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ entry, relatedEntries });
  } catch (error) {
    console.error('Error fetching entry details:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ journalId: string; entryId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const  entryId  = (await params).entryId
  const journalId = (await params).journalId

  try {
    const body = await req.json();
    const { isFavorite } = body;

    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        journalId: journalId,
        journal: {
          userId: session.user.id
        }
      },
    });

    if (!entry) {
      return new NextResponse("Entry not found", { status: 404 });
    }

    const updatedEntry = await prisma.entry.update({
      where: {
        id: entryId,
      },
      data: {
        isFavorite,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ journalId: string; entryId: string }> }
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  
    const  entryId  = (await params).entryId
    const journalId = (await params).journalId
  
    try {
      await prisma.entry.delete({
        where: {
          id: entryId,
          journalId: journalId,
          journal: {
            userId: session.user.id
          }
        },
      });
  
      return new NextResponse("Entry deleted successfully", { status: 200 });
    } catch (error) {
      console.error('Error deleting entry:', error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }