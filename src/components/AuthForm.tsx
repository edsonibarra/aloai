"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AloAvatar } from "./AloAvatar";
import { CuratedBadge } from "./CuratedBadge";

type Mode = "signup" | "login";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setPending(false);
        return;
      }
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setPending(false);
    }
  }

  const isSignup = mode === "signup";
  const field =
    "focus-ring w-full rounded-xl border border-line bg-[#0d0820]/80 px-4 py-3 text-ink placeholder:text-muted/60 transition-colors focus:border-violet-2";

  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-10 md:grid-cols-2">
      <div className="hidden flex-col items-center text-center md:flex">
        <AloAvatar size={260} mood={error ? "encouraging" : isSignup ? "happy" : "idle"} />
        <div className="panel mt-4 max-w-sm p-4 text-ink/95">
          {error
            ? "Hmm, let's fix that and try again. I'm right here."
            : isSignup
              ? "Welcome, future senior engineer! Create your account and I'll set up your placement test."
              : "Welcome back! Your levels and credits are waiting for you."}
        </div>
        <CuratedBadge className="mt-6" />
      </div>

      <div className="panel w-full p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3 md:hidden">
          <AloAvatar size={64} float={false} />
          <p className="text-sm text-muted">{isSignup ? "Let's get you interview-ready." : "Welcome back!"}</p>
        </div>
        <h1 className="font-display text-3xl font-bold">{isSignup ? "Create your account" : "Log in"}</h1>
        <p className="mt-1 text-muted">
          {isSignup ? "Start your quest to ace senior Python interviews." : "Continue your quest."}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {isSignup && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">Name</span>
              <input name="name" required maxLength={60} autoComplete="name" placeholder="Ada" className={field} />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted">Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={isSignup ? 8 : undefined}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "At least 8 characters" : "••••••••"}
              className={field}
            />
          </label>
          {error && (
            <p role="alert" className="rounded-xl border border-red/40 bg-red/10 px-4 py-2.5 text-sm text-red">
              {error}
            </p>
          )}
          <button type="submit" disabled={pending} className="btn btn-primary w-full">
            {pending ? "One moment…" : isSignup ? "Sign up & start" : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? "Already have an account? " : "New to AloAI? "}
          <Link href={isSignup ? "/login" : "/signup"} className="focus-ring rounded font-semibold text-cyan hover:underline">
            {isSignup ? "Log in" : "Create one"}
          </Link>
        </p>
      </div>
    </div>
  );
}
