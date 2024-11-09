import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';

const entrySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().max(50, "Mood must be 50 characters or less").optional(),
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
        isQuickEntry: false,
        isFavorite: false
      }
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