"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";

export async function createResidentProfile(data: {
  bio?: string;
  description?: string;
  // REMOVE: price: number;
  businessType: any;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const existingProfile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existingProfile) {
    throw new Error("Profile already exists");
  }

  const slug = generateSlug(session.user.name || "resident");

  const profile = await prisma.residentProfile.create({
    data: {
      userId: session.user.id,
      bio: data.bio,
      description: data.description,
      // REMOVE: price: data.price,
      businessType: data.businessType, 
      slug,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "RESIDENT" },
  });

  return profile;
}

export async function updateResidentProfile(data: {
  bio?: string;
  description?: string;
  // REMOVE: price?: number;
  bookingEnabled?: boolean;
  businessType: any;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  const updated = await prisma.residentProfile.update({
    where: { id: profile.id },
    data: {
      bio: data.bio ?? profile.bio,
      businessType: data.businessType, 
      description: data.description ?? profile.description,
      // REMOVE: price: data.price ?? profile.price,
      bookingEnabled:
        data.bookingEnabled !== undefined
          ? data.bookingEnabled
          : profile.bookingEnabled,
    },
  });

  return updated;
}

// UPDATED: Work with ResidentImage model
export async function addProfileImage(imageUrl: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  const image = await prisma.residentImage.create({
    data: {
      url: imageUrl,
      residentId: profile.id,
    },
  });

  return image;
}

// UPDATED: Work with ResidentImage model
export async function removeProfileImage(imageId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Verify the image belongs to this resident
  const image = await prisma.residentImage.findFirst({
    where: {
      id: imageId,
      residentId: profile.id,
    },
  });

  if (!image) {
    throw new Error("Image not found or unauthorized");
  }

  await prisma.residentImage.delete({
    where: { id: imageId },
  });

  return { success: true };
}

export async function setAvailability(
  dayOfWeek: number,
  startTime: string,
  endTime: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  const availability = await prisma.availability.upsert({
    where: {
      residentId_dayOfWeek: {
        residentId: profile.id,
        dayOfWeek,
      },
    },
    update: {
      startTime,
      endTime,
    },
    create: {
      residentId: profile.id,
      dayOfWeek,
      startTime,
      endTime,
    },
  });

  return availability;
}

export async function removeAvailability(dayOfWeek: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  await prisma.availability.deleteMany({
    where: {
      residentId: profile.id,
      dayOfWeek,
    },
  });
}

// UPDATED: Include images relation
export async function getResidentProfile() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      availabilities: true,
      images: true,
      products: true,
      categories: true,
      services: true,     
      reviews: {          
        include: {
          customer: true
        }
      }
    },
  });

  return profile;
}