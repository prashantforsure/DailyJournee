import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';

// const entrySchema = z.object({
//   title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
//   content: z.string().min(1, "Content is required"),
//   mood: z.string().optional(),
//   categoryId: z.string().cuid().optional(),
//   tagIds: z.array(z.string().cuid()).optional(),
//   mediaUrls: z.array(z.string().url()).optional(),
//   isQuickEntry: z.boolean().default(false),
//   isFavorite: z.boolean().default(false),
// });

const entrySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().max(50, "Mood must be 50 characters or less").optional(),
  isQuickEntry: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  mediaUrls: z.array(
    z.object({
      url: z.string(),
      type: z.enum(['image', 'audio', 'video']), 
    })
  ).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { journalId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { journalId } = params;

  try {
    const journal = await prisma.journal.findUnique({
      where: {
        id: journalId,
        userId: session.user.id,
      },
    });

    if (!journal) {
      return new NextResponse("Journal not found or you don't have permission to add entries", { status: 404 });
    }

    const body = await req.json();
    const validatedData = entrySchema.parse(body);

    const newEntry = await prisma.entry.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        mood: validatedData.mood,
        journalId: journalId,
        isQuickEntry: validatedData.isQuickEntry,
        isFavorite: validatedData.isFavorite,
        categoryId: validatedData.categoryId,
        tags: validatedData.tagIds?.length 
          ? {
              connect: validatedData.tagIds.map(id => ({ id })),
            }
          : undefined,
        media: validatedData.mediaUrls?.length
          ? {
              create: validatedData.mediaUrls.map(media => ({
                url: media.url,
                type: media.type,
              })),
            }
          : undefined,
      },
      include: {
        tags: true,
        media: true,
        category: true,
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error creating new entry:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const validSortFields = ['createdAt', 'updatedAt', 'title'] as const;
type SortField = typeof validSortFields[number];

const validSortOrders = ['asc', 'desc'] as const;
type SortOrder = typeof validSortOrders[number];

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
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc').toLowerCase();
  const search = searchParams.get('search') || undefined;

  if (!validSortFields.includes(sortBy as SortField)) {
    return new NextResponse("Invalid sort field", { status: 400 });
  }
  if (!validSortOrders.includes(sortOrder as SortOrder)) {
    return new NextResponse("Invalid sort order", { status: 400 });
  }

  const skip = (page - 1) * limit;

  try {
   
    const journal = await prisma.journal.findUnique({
      where: {
        id: journalId,
        userId: session.user.id,
      },
    });

    if (!journal) {
      return new NextResponse("Journal not found or unauthorized", { status: 404 });
    }

    const [entries, totalCount] = await Promise.all([
      prisma.entry.findMany({
        where: {
          journalId,
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: {
          [sortBy]: sortOrder as SortOrder,
        },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          mood: true,
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.entry.count({
        where: {
          journalId,
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
      }),
    ]);

    return NextResponse.json({
      entries,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: { journalId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { journalId } = params;
  const { searchParams } = new URL(req.url);
  const entryIds = searchParams.get('ids')?.split(',') || [];

  if (entryIds.length === 0) {
    return new NextResponse("No entry IDs provided", { status: 400 });
  }

  try {
   
    const journal = await prisma.journal.findUnique({
      where: {
        id: journalId,
        userId: session.user.id,
      },
    });

    if (!journal) {
      return new NextResponse("Journal not found or unauthorized", { status: 404 });
    }

    await prisma.entry.deleteMany({
      where: {
        id: { in: entryIds },
        journalId: journalId,
      },
    });

    return new NextResponse("Entries deleted successfully", { status: 200 });
  } catch (error) {
    console.error('Error deleting entries:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}