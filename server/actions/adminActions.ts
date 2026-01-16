"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function approveResident(residentId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const resident = await prisma.residentProfile.update({
    where: { id: residentId },
    data: { approved: true },
  });

  return resident;
}

export async function rejectResident(residentId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const resident = await prisma.residentProfile.update({
    where: { id: residentId },
    data: { approved: false },
  });

  return resident;
}

export async function featureResident(residentId: string, featured: boolean) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const resident = await prisma.residentProfile.update({
    where: { id: residentId },
    data: { featured },
  });

  return resident;
}

export async function getPendingResidents() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const residents = await prisma.residentProfile.findMany({
    where: { approved: false },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return residents;
}

export async function getAllResidents() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const residents = await prisma.residentProfile.findMany({
    include: { user: true, bookings: true },
    orderBy: { createdAt: "desc" },
  });

  return residents;
}

export async function getAllBookings() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const bookings = await prisma.booking.findMany({
    include: {
      resident: true,
      customer: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings;
}

export async function getAdminStats() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const [totalUsers, totalResidents, totalBookings, totalRevenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.residentProfile.count({ where: { approved: true } }),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { platformFee: true },
      }),
    ]);

  return {
    totalUsers,
    totalResidents,
    totalBookings,
    totalRevenue: totalRevenue._sum.platformFee || 0,
  };
}
