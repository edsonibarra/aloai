import Link from "next/link";
import { AloAvatar } from "@/components/AloAvatar";
import { CuratedBadge } from "@/components/CuratedBadge";
import { GameBackground } from "@/components/GameBackground";
import { Logo } from "@/components/Logo";
import { HeroAlo } from "@/components/landing/HeroAlo";
import { LevelPathTeaser } from "@/components/landing/LevelPathTeaser";
import { TryQuestion } from "@/components/landing/TryQuestion";
import { FadeIn } from "@/components/FadeIn";
import { getSessionUserId } from "@/lib/session";
import { getLevels } from "@/lib/content";
import { CREDITS_PER_LEVEL, CREDITS_PER_QUESTION } from "@/lib/game";

const STEPS = [
  {
    title: "Take the placement test",
    body: "A short set of real senior-interview questions finds your current Python seniority level.",
    icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    title: "Get your starting level",
    body: "No time wasted on what you already know. You start right where your knowledge ends.",
    icon: "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z",
  },
  {
    title: "Climb, unlock, earn",
    body: "Each level unlocks only after you clear the previous one. Alo awards credits for every win.",
    icon: "M3 17l6-6 4 4 8-8 M14 7h7v7",
  },
];

export default async function Landing() {
  const signedIn = (await getSessionUserId()) !== null;
  const questionCount = getLevels().reduce((n, l) => n + l.questions.length, 0);

  return (
    <div className="relative">
      <GameBackground />

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          {signedIn ? (
            <Link href="/map" className="btn btn-primary px-4 py-2.5 text-sm">
              Continue
            </Link>
          ) : (
            <>
              <Link href="/pricing" className="focus-ring hidden rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-ink sm:inline">
                Pricing
              </Link>
              <Link href="/login" className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-ink">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary px-4 py-2.5 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 md:grid-cols-[1.15fr_1fr] md:pt-12">
        <FadeIn>
          <CuratedBadge />
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Ace your <span className="text-gradient">senior Python</span> interview.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80 sm:text-xl">
            AloAI is the way to <strong className="font-semibold text-ink">ace senior Python technical interviews</strong>,
            with questions <strong className="font-semibold text-gold">curated by expert Python software engineers</strong>.
            Level up through game-style stages with <strong className="text-gradient font-bold">Alo</strong>, your AI tutor,
            at your side.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={signedIn ? "/map" : "/signup"} className="btn btn-primary text-base">
              {signedIn ? "Continue your quest" : "Start your quest"}
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            {!signedIn && (
              <Link href="/login" className="btn btn-secondary text-base">
                I have an account
              </Link>
            )}
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {[
              [`${getLevels().length}`, "Levels"],
              [`${questionCount}+`, "Expert questions"],
              ["1", "AI tutor"],
            ].map(([n, label]) => (
              <div key={label} className="panel px-3 py-3 text-center">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-2xl font-bold text-ink">{n}</dd>
                <dd className="text-xs text-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>
        <FadeIn delay={0.15}>
          <HeroAlo />
        </FadeIn>
      </section>

      {/* Try it */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <FadeIn>
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Think you&apos;re senior? Prove it.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
            This is the kind of question you&apos;ll face, hand-picked by expert Python software engineers who run real interviews.
          </p>
        </FadeIn>
        <FadeIn delay={0.1} className="mt-8">
          <TryQuestion />
        </FadeIn>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <FadeIn>
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Your path to the offer</h2>
        </FadeIn>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.1} className="panel p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet to-cyan/70">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={s.icon} />
                  </svg>
                </span>
                <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted">Step {i + 1}</span>
              </div>
              <h3 className="font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.body}</p>
            </FadeIn>
          ))}
        </div>
        <FadeIn className="mt-14">
          <LevelPathTeaser />
          <p className="mt-6 text-center text-sm text-muted">
            Levels stay sealed until you clear the one before. +{CREDITS_PER_QUESTION} credits per question, +{CREDITS_PER_LEVEL} per level.
          </p>
        </FadeIn>
      </section>

      {/* Meet Alo */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <FadeIn className="panel relative overflow-hidden p-6 sm:p-10">
          <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink/20 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <AloAvatar size={200} mood="happy" />
            <div>
              <div className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-cyan">Meet your tutor</div>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Alo knows what interviewers want.</h2>
              <p className="mt-4 leading-relaxed text-muted">
                Alo guides you through every level. Before you start one, she explains <em className="text-ink">why</em> that
                content matters and what senior interviewers are really probing for. After every answer, she gives you
                feedback on your exact choice. When you pass questions and levels, she awards the credits.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-10 text-center">
        <FadeIn>
          <CuratedBadge />
          <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">
            Your next interview is a <span className="text-gold-gradient">boss level</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Train for it with questions from the engineers who ask them. Your placement test and starting level are free.{" "}
            <Link href="/pricing" className="focus-ring rounded font-semibold text-gold hover:underline">
              See pricing
            </Link>
          </p>
          <Link href={signedIn ? "/map" : "/signup"} className="btn btn-primary mt-8 text-base">
            {signedIn ? "Back to the map" : "Create free account"}
          </Link>
        </FadeIn>
      </section>

      <footer className="border-t border-line/60 py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} AloAI · Questions curated by expert Python software engineers ·{" "}
        <Link href="/pricing" className="focus-ring rounded hover:text-ink">
          Pricing
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="focus-ring rounded hover:text-ink">
          Terms
        </Link>
      </footer>
    </div>
  );
}
