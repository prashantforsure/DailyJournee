
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';
import { z } from 'zod';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
const journalId = (await params).journalId

  try {
  
    const journal = await prisma.journal.findUnique({
      where: {
        id: journalId,
        userId: session.user.id,
      },
    });

    if (!journal) {
      return new NextResponse("Journal not found or you don't have permission to delete it", { status: 404 });
    }

    await prisma.journal.delete({
      where: {
        id: journalId,
      },
    });

    return new NextResponse("Journal deleted successfully", { status: 200 });
  } catch (error) {
    console.error('Error deleting journal:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}



export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }
) {
  try {
    
    const journalId = (await params).journalId;
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const journal = await prisma.journal.findUnique({
      where: {
        id: journalId,
        userId: session.user.id,
      },
      include: {
        entries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            mood: true,
            isFavorite: true,
          },
        },
      },
    });

    if (!journal) {
      return new NextResponse("Journal not found", { status: 404 });
    }

    const journalWithCategory = await prisma.journal.findUnique({
      where: { id: journalId },
      include: {
        entries: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const entryCount = await prisma.entry.count({
      where: { journalId: journal.id },
    });

    const favoriteCount = await prisma.entry.count({
      where: { journalId: journal.id, isFavorite: true },
    });

    const entries = await prisma.entry.findMany({
      where: { journalId: journal.id },
      select: { content: true },
    });

    const totalWordCount = entries.reduce((acc, entry) => {
      return acc + entry.content.split(/\s+/).filter(Boolean).length;
    }, 0);

    const moodDistribution = await prisma.entry.groupBy({
      by: ['mood'],
      where: { journalId: journal.id },
      _count: true,
    });

    const statistics = {
      entryCount,
      favoriteCount,
      totalWordCount,
      moodDistribution: Object.fromEntries(
        moodDistribution.map(({ mood, _count }) => [mood, _count])
      ),
    };

    return NextResponse.json({
      ...journal,
      category: journalWithCategory?.entries[0]?.category || null,
      statistics,
    });
  } catch (error) {
    console.error('Error fetching journal details:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const journalSchema = z.object({
  name: z.string().min(1, "Journal name is required").max(100, "Journal name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  icon: z.string().max(50, "Icon name must be 50 characters or less").optional(),
  categoryId: z.string().cuid().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const journalId = (await params).journalId

  try {
    const body = await req.json();
    const validatedData = journalSchema.parse(body);

    const updatedJournal = await prisma.journal.update({
      where: {
        id: journalId,
        userId: session.user.id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedJournal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error updating journal:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
const journalId = (await params).journalId
  const { targetJournalId } = await req.json();

  if (!targetJournalId) {
    return new NextResponse("Target journal ID is required", { status: 400 });
  }

  try {
 
    const [sourceJournal, targetJournal] = await Promise.all([
      prisma.journal.findUnique({ where: { id: journalId, userId: session.user.id } }),
      prisma.journal.findUnique({ where: { id: targetJournalId, userId: session.user.id } }),
    ]);

    if (!sourceJournal || !targetJournal) {
      return new NextResponse("Invalid journal IDs", { status: 400 });
    }

    await prisma.entry.updateMany({
      where: { journalId: journalId },
      data: { journalId: targetJournalId },
    });

    return new NextResponse("Entries transferred successfully", { status: 200 });
  } catch (error) {
    console.error('Error transferring entries:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}