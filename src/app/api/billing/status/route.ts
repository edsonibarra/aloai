import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { hasPass } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ hasPass: await hasPass(user.id) });
}
