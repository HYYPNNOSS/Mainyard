// app/api/residents/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const businessType = searchParams.get('businessType'); // NEW: Filter by business type

    // Build where clause
    const where: any = {
      approved: true,
      bookingEnabled: true,
    };

    // Add business type filter
    if (businessType && businessType !== 'all') {
      where.businessType = businessType;
    }

    // Add category filter - now using Category model
    if (category && category !== 'all') {
      where.categories = {
        some: {
          id: category, // Filter by category ID
          enabled: true,
        },
      };
    }

    // Add search filter
    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          bio: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const residents = await prisma.residentProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        images: {
          take: 1,
          orderBy: {
            id: 'asc',
          },
        },
        categories: {
          where: {
            enabled: true,
          },
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Transform data for frontend
    const transformedResidents = residents.map((resident) => {
      const ratings = resident.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;

      return {
        id: resident.id,
        slug: resident.slug,
        name: resident.user.name,
        title: resident.title,
        bio: resident.bio,
        description: resident.description,
        location: resident.location,
        yearsOfExperience: resident.yearsOfExperience,
        featured: resident.featured,
        businessType: resident.businessType, // NEW: Include business type
        image: resident.images[0]?.url || resident.user.image,
        categories: resident.categories, // Now returns full category objects with id, name, type
        rating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
        reviewCount: resident.reviews.length,
      };
    });

    return NextResponse.json({
      success: true,
      residents: transformedResidents,
    });
  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch residents' },
      { status: 500 }
    );
  }
}