// app/api/resident/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path as needed
import { prisma } from '@/lib/prisma'; // Adjust path as needed

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a resident
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { residentProfile: true }
    });

    if (!user || user.role !== 'RESIDENT' || !user.residentProfile) {
      return NextResponse.json(
        { error: 'Only residents can create services' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, duration, price, categoryId, enabled } = body;

    // Validation
    if (!name || !duration || !price) {
      return NextResponse.json(
        { error: 'Name, duration, and price are required' },
        { status: 400 }
      );
    }

    if (duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be greater than 0' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          residentId: user.residentProfile.id,
          type: 'SERVICE',
        },
      });
    
      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category or category does not belong to you' },
          { status: 400 }
        );
      }
    }
    

    // Get the highest order value for this resident's services
    const maxOrder = await prisma.service.findFirst({
      where: { residentId: user.residentProfile.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    // Create the service
    const service = await prisma.service.create({
      data: {
        residentId: user.residentProfile.id,
        name,
        description: description || null,
        duration,
        price,
        categoryId: categoryId || null, 
        enabled: enabled ?? true,
        order: (maxOrder?.order ?? -1) + 1
      },
      include: {
        category: true, 
      },
    });
    

    return NextResponse.json(
      { 
        message: 'Service created successfully',
        service 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// GET all services for the current resident
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { residentProfile: true }
    });

    if (!user || user.role !== 'RESIDENT' || !user.residentProfile) {
      return NextResponse.json(
        { error: 'Only residents can view their services' },
        { status: 403 }
      );
    }

    const services = await prisma.service.findMany({
      where: { residentId: user.residentProfile.id },
      include: {
        category: true,
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ services });

  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}