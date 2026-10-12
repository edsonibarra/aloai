import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getLevel } from "@/lib/content";
import { getLevelAccess } from "@/lib/progress";

/** Starts a fresh run through a level. */
export async function POST(_req: Request, { params }: { params: Promise<{ level: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const levelId = Number((await params).level);
  const access = getLevel(levelId) ? await getLevelAccess(user, levelId) : "locked";
  if (access === "locked") return NextResponse.json({ error: "Level locked" }, { status: 403 });
  if (access === "paywalled") {
    return NextResponse.json({ error: "This level needs the Interview Pass" }, { status: 402 });
  }
  const attempt = await prisma.levelAttempt.create({ data: { userId: user.id, level: levelId } });
  return NextResponse.json({ attemptId: attempt.id });
}
