import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getLevel } from "@/lib/content";
import { canAccessLevel } from "@/lib/progress";
import { generateLevelIntro } from "@/lib/alo";

export async function GET(_req: Request, { params }: { params: Promise<{ level: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const levelId = Number((await params).level);
  const level = getLevel(levelId);
  if (!level || !(await canAccessLevel(user.id, levelId))) {
    return NextResponse.json({ error: "Level locked" }, { status: 403 });
  }

  const cached = await prisma.aloIntroCache.findUnique({ where: { level: levelId } });
  if (cached) return NextResponse.json({ text: cached.text, live: true });

  const text = await generateLevelIntro(level);
  if (!text) {
    // Claude unavailable: fall back to a short static intro, and don't cache it.
    return NextResponse.json({
      text: `Level ${level.id} is all about ${level.topics.slice(0, 3).join(", ")}. Senior interviewers use these topics to separate people who have memorised Python from people who understand how it really behaves in production. Let's make sure you're in the second group.`,
      live: false,
    });
  }
  await prisma.aloIntroCache.upsert({
    where: { level: levelId },
    create: { level: levelId, text },
    update: {},
  });
  return NextResponse.json({ text, live: true });
}
