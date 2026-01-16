import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resident = await prisma.residentProfile.findUnique({
      where: { id },
      include: { user: true, availabilities: true },
    });

    if (!resident || !resident.approved) {
      return NextResponse.json(
        { error: "Resident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resident);
  } catch (error) {
    console.error("Error fetching resident:", error);
    return NextResponse.json(
      { error: "Failed to fetch resident" },
      { status: 500 }
    );
  }
}
