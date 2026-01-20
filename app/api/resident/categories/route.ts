import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET resident's categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { residentProfile: true }
    });

    if (!user || user.role !== 'RESIDENT' || !user.residentProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      where: { residentId: user.residentProfile.id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { residentProfile: true }
    });

    if (!user || user.role !== 'RESIDENT' || !user.residentProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Verify type matches business type
    const businessType = user.residentProfile.businessType;
    if (businessType === 'SERVICES' && type === 'PRODUCT') {
      return NextResponse.json(
        { error: 'Cannot create product categories with a services-only business' },
        { status: 400 }
      );
    }
    if (businessType === 'PRODUCTS' && type === 'SERVICE') {
      return NextResponse.json(
        { error: 'Cannot create service categories with a products-only business' },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.category.findFirst({
      where: { residentId: user.residentProfile.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const category = await prisma.category.create({
      data: {
        residentId: user.residentProfile.id,
        name,
        description: description || null,
        type,
        order: (maxOrder?.order ?? -1) + 1
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}