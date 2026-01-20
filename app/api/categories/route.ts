export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        enabled: true,
        resident: {
          approved: true,
          bookingEnabled: true,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        residentId: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}