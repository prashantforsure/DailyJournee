

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';


export async function GET(
  req: NextRequest,
  { params }: { params: { journalId: string } }
) {
  const session = await getServerSession(authOptions
  );

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { journalId } = params;

  try {
    const draft = await prisma.entryDraft.findUnique({
      where: {
        userId_journalId: {
          userId: session.user.id,
          journalId: journalId,
        },
      },
    });

    if (!draft) {
      return new NextResponse("Draft not found", { status: 404 });
    }

    return NextResponse.json(draft.content);
  } catch (error) {
    console.error('Error fetching draft:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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
    const content = await req.json();

    const draft = await prisma.entryDraft.upsert({
      where: {
        userId_journalId: {
          userId: session.user.id,
          journalId: journalId,
        },
      },
      update: {
        content: content,
      },
      create: {
        userId: session.user.id,
        journalId: journalId,
        content: content,
      },
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error saving draft:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}