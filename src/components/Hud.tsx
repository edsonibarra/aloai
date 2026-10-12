"use client";
import { useRouter } from "next/navigation";
import { CreditCounter } from "./CreditCounter";
import { Logo } from "./Logo";

export function Hud({ name, credits }: { name: string; credits: number }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo href="/map" />
        <div className="flex items-center gap-3">
          <CreditCounter value={credits} />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-violet/30 font-display font-bold text-violet-2">
              {name.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-32 truncate text-sm text-muted">{name}</span>
          </div>
          <button onClick={logout} className="focus-ring rounded-lg px-2 py-1 text-sm text-muted hover:text-ink">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
