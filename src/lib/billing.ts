import "server-only";
import Stripe from "stripe";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";

/**
 * Billing is on only when Stripe is fully configured. While it is off, every level the user
 * has unlocked stays playable, so deploying this code before adding keys changes nothing for users.
 */
export function billingEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID && process.env.STRIPE_WEBHOOK_SECRET);
}

let client: Stripe | null = null;
export function stripe(): Stripe {
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY as string);
  return client;
}

export function appUrl(req: Request): string {
  return (process.env.APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");
}

export async function hasPass(userId: string): Promise<boolean> {
  const paid = await prisma.purchase.findFirst({ where: { userId, status: "paid" }, select: { id: true } });
  return paid !== null;
}

export type PassPrice = { amount: number; currency: string; formatted: string };

/** The Interview Pass price, read from Stripe so it can be changed in the dashboard without a deploy. */
export const getPassPrice = unstable_cache(
  async (): Promise<PassPrice | null> => {
    if (!billingEnabled()) return null;
    try {
      const price = await stripe().prices.retrieve(process.env.STRIPE_PRICE_ID as string);
      if (price.unit_amount === null) return null;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: price.currency,
        minimumFractionDigits: price.unit_amount % 100 === 0 ? 0 : 2,
      }).format(price.unit_amount / 100);
      return { amount: price.unit_amount, currency: price.currency, formatted };
    } catch (error) {
      console.error("[billing] Could not load the Interview Pass price:", error);
      return null;
    }
  },
  ["pass-price"],
  { revalidate: 3600 },
);

/** What the HUD should offer: a billing link for owners, a "Get the Pass" button otherwise. */
export type PassState = "owned" | "available" | "off";
export async function passState(userId: string): Promise<PassState> {
  if (!billingEnabled()) return "off";
  return (await hasPass(userId)) ? "owned" : "available";
}
