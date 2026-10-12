import { redirect } from "next/navigation";
import { GameBackground } from "@/components/GameBackground";
import { LevelPlay } from "@/components/LevelPlay";
import { getLevel, LEVEL_COUNT, toPublic } from "@/lib/content";
import { passState } from "@/lib/billing";
import { prisma } from "@/lib/db";
import { getLevelAccess } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export default async function LevelPage({ params }: { params: Promise<{ n: string }> }) {
  const user = await requireUser();
  if (!user.placementDone) redirect("/placement");

  const levelId = Number((await params).n);
  const level = getLevel(levelId);
  const progress = level
    ? await prisma.levelProgress.findUnique({ where: { userId_level: { userId: user.id, level: levelId } } })
    : null;
  // Locked or unknown levels are never rendered; paywalled ones send the user to the Pass.
  if (!level || !progress) redirect("/map");
  if ((await getLevelAccess(user, levelId)) === "paywalled") redirect(`/pricing?level=${levelId}`);

  return (
    <div className="min-h-dvh">
      <GameBackground glyphs={false} />
      <LevelPlay
        user={{ name: user.name, credits: user.credits, pass: await passState(user.id) }}
        level={{
          id: level.id,
          title: level.title,
          tagline: level.tagline,
          topics: level.topics,
          questions: level.questions.map(toPublic),
          completed: progress.status === "completed",
          bestScore: progress.bestScore,
          isFinal: level.id === LEVEL_COUNT,
        }}
      />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  return { title: `Level ${(await params).n} · AloAI` };
}
