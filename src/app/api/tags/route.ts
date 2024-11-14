
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';


export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
  
    const tags = await prisma.tag.findMany({
      where: {
        entries: {
          some: {
            journal: {
              userId: session.user.id
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { entries: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { name, entryId } = await req.json();

    if (!name || typeof name !== 'string') {
      return new NextResponse("Invalid tag name", { status: 400 });
    }

    if (!entryId || typeof entryId !== 'string') {
      return new NextResponse("Invalid entry ID", { status: 400 });
    }

    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        journal: {
          userId: session.user.id
        }
      }
    });

    if (!entry) {
      return new NextResponse("Entry not found or unauthorized", { status: 404 });
    }
    const tag = await prisma.tag.create({
      data: {
        name,
        entries: {
          connect: { id: entryId }
        }
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}