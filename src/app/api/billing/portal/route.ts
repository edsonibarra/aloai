import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { appUrl, billingEnabled, stripe } from "@/lib/billing";

/** Opens Stripe's Customer Portal, where users can see their receipts and invoices. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!billingEnabled() || !user.stripeCustomerId) {
    return NextResponse.json({ error: "No billing history yet" }, { status: 404 });
  }
  try {
    const portal = await stripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl(req)}/map`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("[billing] Portal session failed:", error);
    return NextResponse.json({ error: "Could not open billing. Please try again." }, { status: 502 });
  }
}
