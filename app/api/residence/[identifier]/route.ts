// app/api/residents/[identifier]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ identifier: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { identifier } = await params;

    // Try to find resident by slug first, then by id
    const resident = await prisma.residentProfile.findFirst({
      where: {
        OR: [
          { slug: identifier },
          { id: identifier }
        ],
        approved: true
      },
      include: {
        user: true,
        availabilities: true,
        images: true,
        categories: {
          where: { enabled: true },
          orderBy: { order: 'asc' }
        },
        services: {
          where: { enabled: true },
          include: {
            category: true
          },
          orderBy: { order: 'asc' }
        },
        products: {
          where: { enabled: true },
          include: {
            category: true,
            images: {
              orderBy: { order: 'asc' },
              take: 1
            }
          },
          orderBy: { order: 'asc' }
        },
        reviews: {
          include: {
            customer: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!resident) {
      return NextResponse.json(
        { error: "Resident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resident);
  } catch (error) {
    console.error("Error fetching resident:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}