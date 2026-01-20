"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stripe, calculateFees } from "@/lib/stripe";
import { formatDate, generateTimeSlots, getDayOfWeek } from "@/lib/utils";

export async function createBooking(
  residentId: string,
  date: string,
  timeSlot: string,
  serviceIds: string[] // Changed to accept multiple services
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Calculate total price from selected services
  const services = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
      residentId,
      enabled: true,
    },
  });

  const totalPrice = services.reduce((sum, service) => sum + service.price, 0);

  const booking = await prisma.booking.create({
    data: {
      residentId,
      customerId: session.user.id,
      date: new Date(date),
      timeSlot,
      totalPrice,
      status: "PENDING",
      services: {
        create: serviceIds.map(serviceId => ({
          serviceId,
          quantity: 1,
        })),
      },
    },
    include: {
      services: {
        include: {
          service: true,
        },
      },
    },
  });

  return booking;
}

export async function confirmBooking(bookingId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { resident: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });

  return updated;
}

export async function cancelBooking(bookingId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // If payment exists, refund it
  if (booking.payment) {
    await stripe.refunds.create({
      payment_intent: booking.payment.stripePaymentId,
    });

    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: "REFUNDED" },
    });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  return updated;
}

export async function getAvailableSlots(
  residentId: string,
  date: string
): Promise<string[]> {
  const bookingDate = new Date(date + 'T00:00:00'); // Add time to prevent timezone shift
  const dayOfWeek = bookingDate.getDay(); // Use .getDay() directly

  const resident = await prisma.residentProfile.findUnique({
    where: { id: residentId },
    include: { availabilities: true, bookings: true },
  });

  if (!resident) {
    throw new Error("Resident not found");
  }

  // Find availability for this day
  const availability = resident.availabilities.find(
    (a) => a.dayOfWeek === dayOfWeek
  );

  if (!availability) {
    return [];
  }

  // Generate all possible slots
  const allSlots = generateTimeSlots(
    availability.startTime,
    availability.endTime,
    60
  );

  // Filter out booked slots - fix date comparison
  const bookedSlots = resident.bookings
    .filter((b) => {
      const bookingDateStr = b.date.toISOString().split('T')[0];
      return bookingDateStr === date && 
        (b.status === "CONFIRMED" || b.status === "PENDING");
    })
    .map((b) => b.timeSlot);

  return allSlots.filter((slot) => !bookedSlots.includes(slot));
}

export async function getResidentBookings(residentId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const resident = await prisma.residentProfile.findUnique({
    where: { id: residentId },
  });

  if (!resident || resident.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const bookings = await prisma.booking.findMany({
    where: { residentId },
    include: { customer: true, payment: true },
    orderBy: { date: "desc" },
  });

  return bookings;
}

export async function getCustomerBookings() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: session.user.id },
    include: { resident: true, payment: true },
    orderBy: { date: "desc" },
  });

  return bookings;
}
