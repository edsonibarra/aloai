import { redirect } from "next/navigation";
import { GameBackground } from "@/components/GameBackground";
import { Hud } from "@/components/Hud";
import { LevelMap, type MapNode } from "@/components/LevelMap";
import { getLevels } from "@/lib/content";
import { getLevelStatuses } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Level map · AloAI" };

export default async function MapPage() {
  const user = await requireUser();
  if (!user.placementDone) redirect("/placement");

  const statuses = await getLevelStatuses(user.id);
  // Locked levels are sent without any content: only their number.
  const nodes: MapNode[] = getLevels().map((level) => {
    const status = statuses.get(level.id);
    return status
      ? { id: level.id, status, title: level.title, tagline: level.tagline }
      : { id: level.id, status: "locked" };
  });

  return (
    <div className="min-h-dvh">
      <GameBackground />
      <Hud name={user.name} credits={user.credits} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <LevelMap nodes={nodes} name={user.name} />
      </main>
    </div>
  );
}
