import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-15.acacia",
});

export const PLATFORM_FEE_PERCENT =
  parseInt(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT || "10", 10) / 100;

export function calculateFees(amount: number) {
  const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT);
  const residentEarnings = amount - platformFee;
  return { platformFee, residentEarnings };
}
