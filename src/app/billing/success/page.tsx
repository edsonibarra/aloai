import { GameBackground } from "@/components/GameBackground";
import { Hud } from "@/components/Hud";
import { PassUnlock } from "@/components/PassUnlock";
import { hasPass } from "@/lib/billing";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Interview Pass · AloAI" };

export default async function BillingSuccessPage() {
  const user = await requireUser();
  const owned = await hasPass(user.id);
  return (
    <div className="min-h-dvh">
      <GameBackground glyphs={false} />
      <Hud name={user.name} credits={user.credits} pass={owned ? "owned" : "available"} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <PassUnlock name={user.name} alreadyOwned={owned} />
      </main>
    </div>
  );
}
