import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { appUrl, billingEnabled, hasPass, stripe } from "@/lib/billing";
import { consume, LIMITS } from "@/lib/rate-limit";

/** Creates a Stripe Checkout Session for the Interview Pass and returns its URL. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!billingEnabled()) return NextResponse.json({ error: "Payments are not available yet" }, { status: 503 });
  if (await hasPass(user.id)) return NextResponse.json({ error: "You already own the Interview Pass" }, { status: 409 });
  if (!(await consume(`checkout:${user.id}`, LIMITS.checkout))) {
    return NextResponse.json({ error: "Too many checkout attempts. Try again later." }, { status: 429 });
  }

  try {
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe().customers.create(
        { email: user.email, name: user.name, metadata: { userId: user.id } },
        { idempotencyKey: `customer-${user.id}` },
      );
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const base = appUrl(req);
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: user.id,
      metadata: { userId: user.id },
      line_items: [{ price: process.env.STRIPE_PRICE_ID as string, quantity: 1 }],
      invoice_creation: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing?canceled=1`,
    });
    if (!session.url) throw new Error("Checkout session has no URL");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[billing] Checkout session failed:", error);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
