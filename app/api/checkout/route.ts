import { stripe, calculateFees } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { bookingId, residentId, amount } = await request.json();

    if (!bookingId || !residentId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { resident: true, customer: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const { platformFee, residentEarnings } = calculateFees(amount * 100); // Convert to cents

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking with ${booking.resident.user.name}`,
              description: `${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}`,
            },
            unit_amount: amount * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/booking-success?bookingId=${bookingId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/book/${residentId}`,
      metadata: {
        bookingId,
        residentId,
      },
    });

    // Store payment record
    await prisma.payment.create({
      data: {
        bookingId,
        residentId,
        stripePaymentId: session.id,
        amount: amount * 100,
        platformFee,
        residentEarnings,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
