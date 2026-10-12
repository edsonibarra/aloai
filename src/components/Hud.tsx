"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCounter } from "./CreditCounter";
import { Logo } from "./Logo";

export type PassState = "owned" | "available" | "off";

export function Hud({ name, credits, pass = "off" }: { name: string; credits: number; pass?: PassState }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  async function openBilling() {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (data.url) window.location.href = data.url;
  }
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo href="/map" />
        <div className="flex items-center gap-3">
          {pass === "available" && (
            <Link
              href="/pricing"
              className="focus-ring hidden rounded-full border border-pink/50 bg-pink/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-pink transition-colors hover:bg-pink/20 sm:inline-block"
            >
              Get the Pass
            </Link>
          )}
          {pass === "owned" && (
            <span className="hidden rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-gold sm:inline-block">
              Pass holder
            </span>
          )}
          <CreditCounter value={credits} />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-violet/30 font-display font-bold text-violet-2">
              {name.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-32 truncate text-sm text-muted">{name}</span>
          </div>
          {pass === "owned" && (
            <button onClick={openBilling} className="focus-ring rounded-lg px-2 py-1 text-sm text-muted hover:text-ink">
              Billing
            </button>
          )}
          <button onClick={logout} className="focus-ring rounded-lg px-2 py-1 text-sm text-muted hover:text-ink">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
