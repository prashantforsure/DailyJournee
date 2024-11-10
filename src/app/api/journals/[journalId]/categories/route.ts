
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';

import { z } from 'zod';
import { authOptions } from '@/lib/auth/auth';

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name must be 50 characters or less"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { journalId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { journalId } = params;

  try {
    const categories = await prisma.category.findMany({
      where: {
        journalId: journalId,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
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
    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    const newCategory = await prisma.category.create({
      data: {
        ...validatedData,
        journalId: journalId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error creating category:', error);
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

  try {
    const body = await req.json();
    const { id, ...updateData } = categorySchema.parse(body);

    const updatedCategory = await prisma.category.update({
      where: {
        id: id,
        journalId: journalId,
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error updating category:', error);
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
  const categoryId = searchParams.get('id');

  if (!categoryId) {
    return new NextResponse("Category ID is required", { status: 400 });
  }

  try {
    await prisma.category.delete({
      where: {
        id: categoryId,
        journalId: journalId,
        userId: session.user.id,
      },
    });

    return new NextResponse("Category deleted successfully", { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}