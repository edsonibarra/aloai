import { redirect } from "next/navigation";
import { GameBackground } from "@/components/GameBackground";
import { Hud } from "@/components/Hud";
import { PlacementTest } from "@/components/PlacementTest";
import { getPlacement, toPublic } from "@/lib/content";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Placement test · AloAI" };

export default async function PlacementPage() {
  const user = await requireUser();
  if (user.placementDone) redirect("/map");
  const questions = getPlacement().map(toPublic);
  return (
    <div className="min-h-dvh">
      <GameBackground glyphs={false} />
      <Hud name={user.name} credits={user.credits} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <PlacementTest name={user.name} questions={questions} />
      </main>
    </div>
  );
}
