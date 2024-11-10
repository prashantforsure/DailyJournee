
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';

import { z } from 'zod';
import { authOptions } from '@/lib/auth/auth';

const categorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(50, "Category name must be 50 characters or less"),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
    icon: z.string().max(50, "Icon name must be 50 characters or less").optional(),
  });
  
  export async function GET(
    req: NextRequest,
    { params }: { params: { journalId: string; categoryId: string } }
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  
    const { categoryId } = params;
  
    try {
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
          userId: session.user.id,
        },
        include: {
          entries: {
            where: {
              journalId: params.journalId
            },
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
  
      if (!category) {
        return new NextResponse("Category not found", { status: 404 });
      }
  
      return NextResponse.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
  
  export async function PUT(
    req: NextRequest,
    { params }: { params: { journalId: string; categoryId: string } }
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  
    const { categoryId } = params;
  
    try {
      const body = await req.json();
      const validatedData = categorySchema.parse(body);
  
      const updatedCategory = await prisma.category.update({
        where: {
          id: categoryId,
          userId: session.user.id,
        },
        data: validatedData,
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
    { params }: { params: { journalId: string; categoryId: string } }
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  
    const { categoryId } = params;
  
    try {
      await prisma.category.delete({
        where: {
          id: categoryId,
          userId: session.user.id,
        },
      });
  
      return new NextResponse("Category deleted successfully", { status: 200 });
    } catch (error) {
      console.error('Error deleting category:', error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }