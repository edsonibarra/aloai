import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getLevel } from "@/lib/content";
import { canAccessLevel } from "@/lib/progress";

/** Starts a fresh run through a level. */
export async function POST(_req: Request, { params }: { params: Promise<{ level: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const levelId = Number((await params).level);
  if (!getLevel(levelId) || !(await canAccessLevel(user.id, levelId))) {
    return NextResponse.json({ error: "Level locked" }, { status: 403 });
  }
  const attempt = await prisma.levelAttempt.create({ data: { userId: user.id, level: levelId } });
  return NextResponse.json({ attemptId: attempt.id });
}
