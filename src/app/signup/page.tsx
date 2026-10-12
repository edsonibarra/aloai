import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { GameBackground } from "@/components/GameBackground";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Sign up · AloAI" };

export default async function Page() {
  const user = await getCurrentUser();
  if (user) redirect(user.placementDone ? "/map" : "/placement");
  return (
    <div className="flex min-h-dvh flex-col">
      <GameBackground glyphs={false} />
      <nav className="mx-auto w-full max-w-6xl px-4 py-5">
        <Logo />
      </nav>
      <main className="flex flex-1 items-center">
        <AuthForm mode="signup" />
      </main>
    </div>
  );
}
