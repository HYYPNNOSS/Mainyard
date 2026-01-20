import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET resident's products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { residentProfile: true }
    });

    if (!user?.residentProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      where: { residentId: user.residentProfile.id },
      include: {
        category: true,
        images: true,
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST create product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { residentProfile: true }
    });

    if (!user?.residentProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const businessType = user.residentProfile.businessType;
    if (businessType === 'SERVICES') {
      return NextResponse.json(
        { error: 'Cannot create products with a services-only business' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, categoryId, stock, trackInventory } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          residentId: user.residentProfile.id,
          type: 'PRODUCT',
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
    }

    const maxOrder = await prisma.product.findFirst({
      where: { residentId: user.residentProfile.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const product = await prisma.product.create({
      data: {
        residentId: user.residentProfile.id,
        name,
        description,
        price,
        categoryId,
        trackInventory: trackInventory ?? false,
        stock: trackInventory ? (stock ?? 0) : null,
        order: (maxOrder?.order ?? -1) + 1
      },
      include: {
        category: true,
        images: true,
      }
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}