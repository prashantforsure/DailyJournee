
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';


const journalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().max(50).optional(),
  categoryId: z.string().cuid().optional(),
});

//this is the api to create the journal
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = journalSchema.parse(body);

    const newJournal = await prisma.journal.create({
      data: {
        name: validatedData.name, 
        description: validatedData.description,
        color: validatedData.color,
        icon: validatedData.icon,
        
        userId: session.user.id, 
      },
    });

    return NextResponse.json(newJournal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error creating new journal:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

//this is the api to get all the journal of the user
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  
    const searchParams = req.nextUrl.searchParams;
    const sort = searchParams.get('sort') as 'name' | 'createdAt' | 'updatedAt' | undefined;
    const order = searchParams.get('order') as 'asc' | 'desc' | undefined;
    const filter = searchParams.get('filter');
  
    try {
      const journals = await prisma.journal.findMany({
        where: {
          userId: session.user.id,
          ...(filter ? {
            OR: [
              { name: { contains: filter, mode: 'insensitive' } },
              { description: { contains: filter, mode: 'insensitive' } },
            ],
          } : {}),
        },
        orderBy: sort ? { [sort]: order || 'asc' } : undefined,
        include: {
          entries: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      });
  
      const journalsWithStats = journals.map(journal => ({
        ...journal,
        entryCount: journal.entries.length,
        lastEntryDate: journal.entries.length > 0
          ? journal.entries.reduce((latest, entry) => 
              latest.getTime() > entry.createdAt.getTime() ? latest : entry.createdAt,
              new Date(0)
            )
          : null,
      }));
  
      return NextResponse.json(journalsWithStats);
    } catch (error) {
      console.error('Error fetching journals:', error);
      return new NextResponse("Internal Error", { status: 500 });
    }
}