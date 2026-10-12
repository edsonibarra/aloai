"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AloSpeech } from "./AloSpeech";
import { Confetti } from "./Confetti";
import { CuratedBadge } from "./CuratedBadge";

const POLL_MS = 1500;
const GIVE_UP_MS = 45_000;

/** Waits for Stripe's webhook to confirm the purchase, then plays the unlock moment. */
export function PassUnlock({ name, alreadyOwned }: { name: string; alreadyOwned: boolean }) {
  const [state, setState] = useState<"waiting" | "unlocked" | "slow">(alreadyOwned ? "unlocked" : "waiting");

  useEffect(() => {
    if (state !== "waiting") return;
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/billing/status", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.hasPass) return setState("unlocked");
      } catch {
        // keep polling
      }
      if (Date.now() - started > GIVE_UP_MS) return setState("slow");
      timer = setTimeout(poll, POLL_MS);
    }
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [state]);

  if (state !== "unlocked") {
    return (
      <div className="pt-6">
        <AloSpeech
          size={130}
          mood={state === "slow" ? "encouraging" : "thinking"}
          loading={state === "waiting"}
          loadingLabel="Alo is confirming your payment with Stripe"
          text={
            state === "slow"
              ? "Your payment is still being confirmed. Some payment methods take a little longer. I'll unlock every level automatically the moment it clears, and Stripe will email your receipt. You can head back to the map in the meantime."
              : null
          }
          footer={
            <Link href="/map" className="btn btn-secondary">
              Back to the map
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative text-center">
      <Confetti count={120} />
      <div className="relative mx-auto mt-4 grid h-72 w-72 place-items-center">
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background: "repeating-conic-gradient(from 0deg, rgba(255,95,162,0.3) 0deg 9deg, transparent 9deg 22deg)",
            maskImage: "radial-gradient(circle, black 25%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle, black 25%, transparent 70%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.2 }}
          className="relative grid h-52 w-40 place-items-center rounded-3xl border-2 border-gold bg-gradient-to-b from-[#3b1d5e] via-[#24124a] to-[#140a2e] shadow-[0_0_60px_rgba(255,201,74,0.6)]"
        >
          <div className="px-3 text-center">
            <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-pink">Legendary</div>
            <div className="text-gold-gradient mt-2 font-display text-3xl font-bold leading-tight">Interview Pass</div>
            <div className="mt-3 text-xs text-muted">All levels unlocked</div>
          </div>
        </motion.div>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-2 font-display text-4xl font-bold sm:text-5xl"
      >
        Pass unlocked!
      </motion.h1>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mx-auto mt-8 max-w-2xl text-left">
        <AloSpeech
          size={100}
          mood="happy"
          text={`Welcome to the full quest, ${name}! Every level is now open to you, all of it curated by expert Python software engineers. Stripe has emailed your receipt. Let's go get that senior offer.`}
          footer={
            <Link href="/map" className="btn btn-primary">
              Continue the quest
            </Link>
          }
        />
      </motion.div>
      <div className="mt-8">
        <CuratedBadge />
      </div>
    </div>
  );
}
