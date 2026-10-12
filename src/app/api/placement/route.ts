import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getLevel, getPlacement, LEVEL_COUNT } from "@/lib/content";
import { startLevelFromPlacement } from "@/lib/game";
import { canPlayLevels } from "@/lib/progress";

const schema = z.object({ answers: z.record(z.string(), z.number().int().min(0)) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.placementDone) {
    return NextResponse.json({ error: "Placement test already completed" }, { status: 409 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid answers" }, { status: 400 });

  const questions = getPlacement();
  const results = questions.map((q) => ({
    id: q.id,
    level: q.level,
    correct: parsed.data.answers[q.id] === q.answer,
  }));
  const startLevel = startLevelFromPlacement(results, LEVEL_COUNT);

  // Levels below the start level are completed by placement; the start level is unlocked.
  await prisma.$transaction([
    ...Array.from({ length: startLevel }, (_, i) => i + 1).map((level) =>
      prisma.levelProgress.upsert({
        where: { userId_level: { userId: user.id, level } },
        create: { userId: user.id, level, status: level < startLevel ? "completed" : "unlocked" },
        update: {},
      }),
    ),
    prisma.user.update({ where: { id: user.id }, data: { placementDone: true, startLevel } }),
  ]);

  return NextResponse.json({
    startLevel,
    needsPass: !(await canPlayLevels(user)),
    levelTitle: getLevel(startLevel)?.title,
    score: results.filter((r) => r.correct).length,
    total: results.length,
    perLevel: Array.from({ length: LEVEL_COUNT }, (_, i) => {
      const forLevel = results.filter((r) => r.level === i + 1);
      return { level: i + 1, correct: forLevel.filter((r) => r.correct).length, total: forLevel.length };
    }),
  });
}
