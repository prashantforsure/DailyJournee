import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/auth';

const quickEntrySchema = z.object({
  content: z.string().min(1, "Content is required"),
  mood: z.string().optional(),
  isQuickEntry: z.literal(true),
  isFavorite: z.boolean().optional(),
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

    const journal = await prisma.journal.findFirst({
      where: {
        id: journalId,
        userId: session.user.id
      }
    });

    if (!journal) {
      return new NextResponse("Journal not found", { status: 404 });
    }

    const body = await req.json();
    const validatedData = quickEntrySchema.parse(body);

    const newEntry = await prisma.entry.create({
      data: {
        title: "Quick Entry", 
        content: validatedData.content,
        mood: validatedData.mood,
        isQuickEntry: true,
        isFavorite: validatedData.isFavorite ?? false,
        journal: {
          connect: { id: journalId }
        }
      },
    });

    return NextResponse.json(newEntry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error creating quick entry:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}