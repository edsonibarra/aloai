import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/billing";

type Tx = Prisma.TransactionClient;

/**
 * Stripe webhook: the only place that grants or revokes the Interview Pass.
 * Each event is recorded in the same transaction as its effect, so a retried event is a no-op
 * and a failed one rolls back and is retried by Stripe.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.stripeEvent.create({ data: { id: event.id, type: event.type } });
      await handle(tx, event);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error(`[billing] Webhook ${event.type} (${event.id}) failed:`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

async function handle(tx: Tx, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      // Delayed payment methods complete with "unpaid"; access waits for async_payment_succeeded.
      if (session.payment_status === "paid") await grantPass(tx, session);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      // Full refunds revoke the pass; partial refunds (goodwill credits) keep it.
      if (paymentIntentId && charge.amount_refunded >= charge.amount) {
        await tx.purchase.updateMany({ where: { paymentIntentId }, data: { status: "refunded" } });
      }
      break;
    }
  }
}

async function grantPass(tx: Tx, session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.userId;
  if (!userId || !(await tx.user.findUnique({ where: { id: userId }, select: { id: true } }))) {
    throw new Error(`Checkout session ${session.id} has no matching user`);
  }
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  await tx.purchase.upsert({
    where: { checkoutSessionId: session.id },
    create: {
      userId,
      checkoutSessionId: session.id,
      paymentIntentId: paymentIntentId ?? null,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "paid",
    },
    update: { status: "paid", paymentIntentId: paymentIntentId ?? null },
  });
}
