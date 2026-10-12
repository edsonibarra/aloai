import Link from "next/link";
import { AloSpeech } from "@/components/AloSpeech";
import { CheckoutButton } from "@/components/CheckoutButton";
import { CuratedBadge } from "@/components/CuratedBadge";
import { FadeIn } from "@/components/FadeIn";
import { GameBackground } from "@/components/GameBackground";
import { Logo } from "@/components/Logo";
import { billingEnabled, getPassPrice, hasPass } from "@/lib/billing";
import { getLevel, getLevels } from "@/lib/content";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Pricing · AloAI" };

const CHECK = "M5 12l5 5L20 7";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const [price, owned] = await Promise.all([getPassPrice(), user ? hasPass(user.id) : Promise.resolve(false)]);
  const enabled = billingEnabled() && price !== null;
  const levels = getLevels();
  const wanted = params.level ? getLevel(Number(params.level)) : undefined;
  const questionCount = levels.reduce((n, l) => n + l.questions.length, 0);

  const aloLine = params.canceled
    ? "No problem, checkout was canceled and you weren't charged. Your placement result is saved, and the Pass will be here whenever you're ready."
    : wanted
      ? `Level ${wanted.id}, ${wanted.title}, is part of the Interview Pass. One payment unlocks it and every other level for good, so you can play, replay and master all of it.`
      : "Take the placement test free to find your level. Then the Interview Pass unlocks every level with one payment. No subscription.";

  return (
    <div className="relative min-h-dvh">
      <GameBackground />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo href={user ? "/map" : "/"} />
        <Link href={user ? "/map" : "/login"} className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-ink">
          {user ? "Back to the map" : "Log in"}
        </Link>
      </nav>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-4">
        <FadeIn className="text-center">
          <CuratedBadge />
          <h1 className="mt-6 font-display text-4xl font-bold sm:text-6xl">
            Unlock the <span className="text-gradient">whole quest</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink/80">
            One payment unlocks every level of the quest to ace the senior Python interview.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mx-auto mt-10 max-w-3xl">
          <AloSpeech size={110} mood={params.canceled ? "encouraging" : "happy"} text={aloLine} />
        </FadeIn>

        <div className="mx-auto mt-10 max-w-md">
          {/* Interview Pass */}
          <FadeIn delay={0.25} className="relative">
            <div aria-hidden className="absolute -inset-[2px] rounded-[24px] bg-[conic-gradient(from_180deg,var(--gold),var(--pink),var(--violet),var(--cyan),var(--gold))] opacity-80 blur-[1px]" />
            <div className="panel relative flex h-full flex-col overflow-hidden !bg-panel-solid p-6 sm:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
              <div className="flex items-center justify-between">
                <div className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-gold">Interview Pass</div>
                <span className="rounded-full bg-gradient-to-r from-pink to-violet px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Legendary
                </span>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-gold-gradient font-display text-6xl font-bold">{enabled ? price.formatted : "Soon"}</span>
                {enabled && <span className="mb-2 text-muted">one-time</span>}
              </div>
              <p className="mt-2 text-muted">Lifetime access. No subscription, no renewals.</p>
              <ul className="mt-6 flex-1 space-y-3 text-ink/90">
                {[
                  `All ${levels.length} levels and ${questionCount}+ expert-curated questions`,
                  "Every level from core semantics to interpreter internals",
                  "Alo's briefing on why each level matters",
                  "Replay any level, any time",
                  "Alo's personalised feedback on every answer",
                ].map((f) => (
                  <Feature key={f} text={f} tone="text-gold" />
                ))}
              </ul>
              <div className="mt-8">
                {owned ? (
                  <Link href="/map" className="btn btn-primary w-full">
                    You own the Pass · Play
                  </Link>
                ) : !enabled ? (
                  <button disabled className="btn btn-primary w-full">
                    Coming soon
                  </button>
                ) : user ? (
                  <CheckoutButton />
                ) : (
                  <Link href="/signup" className="btn btn-primary w-full">
                    Sign up to get the Pass
                  </Link>
                )}
                {!owned && (
                  <p className="mt-3 text-center text-sm text-ink/80">
                    Not sure yet?{" "}
                    <Link href={user ? "/map" : "/signup"} className="focus-ring rounded font-semibold text-cyan hover:underline">
                      {user ? "Back to the map" : "Take the placement test free"}
                    </Link>
                  </p>
                )}
                <p className="mt-3 text-center text-xs text-muted">
                  Secure payment by Stripe · 14-day refund policy ·{" "}
                  <Link href="/terms" className="focus-ring rounded underline hover:text-ink">
                    Terms
                  </Link>
                </p>
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">Questions</h2>
          <dl className="mt-6 space-y-4">
            {[
              ["Is this a subscription?", "No. You pay once and keep access to every level."],
              ["Is anything free?", "Yes, the placement test. It finds your level so you know exactly where the Pass will start you."],
              ["Can I buy credits?", "No. Credits are rewards Alo gives you for passing questions and levels. They can only be earned."],
              ["What if it's not for me?", "Ask for a refund within 14 days of purchase and you'll get your money back in full. See the Terms for details."],
            ].map(([q, a]) => (
              <div key={q} className="panel p-5">
                <dt className="font-display font-bold">{q}</dt>
                <dd className="mt-1 text-ink/80">{a}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </main>
    </div>
  );
}

function Feature({ text, tone }: { text: string; tone: string }) {
  return (
    <li className="flex items-start gap-3">
      <svg viewBox="0 0 24 24" className={`mt-0.5 h-5 w-5 shrink-0 ${tone}`} fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
        <path d={CHECK} />
      </svg>
      {text}
    </li>
  );
}
