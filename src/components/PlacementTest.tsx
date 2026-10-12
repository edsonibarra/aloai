"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { SENIORITY_BY_START_LEVEL } from "@/lib/game";
import { AloAvatar } from "./AloAvatar";
import { AloSpeech } from "./AloSpeech";
import { Confetti } from "./Confetti";
import { CuratedBadge } from "./CuratedBadge";
import { ProgressPips } from "./ProgressPips";
import { QuestionCard, type PublicQuestion } from "./QuestionCard";

type Result = {
  startLevel: number;
  needsPass: boolean;
  levelTitle: string;
  score: number;
  total: number;
  perLevel: { level: number; correct: number; total: number }[];
};

export function PlacementTest({ name, questions }: { name: string; questions: PublicQuestion[] }) {
  const [phase, setPhase] = useState<"intro" | "quiz" | "submitting" | "result">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = questions[index];
  const selected = q ? (answers[q.id] ?? null) : null;
  const isLast = index === questions.length - 1;

  async function submit(final: Record<string, number>) {
    setPhase("submitting");
    setError(null);
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: final }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit");
      setResult(data);
      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit");
      setPhase("quiz");
    }
  }

  function next() {
    if (selected === null) return;
    if (isLast) submit(answers);
    else setIndex((i) => i + 1);
  }

  if (phase === "intro") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4">
        <div className="text-center">
          <div className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-cyan">Placement test</div>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Let&apos;s find your level</h1>
        </div>
        <AloSpeech
          size={140}
          mood="happy"
          text={`Hi ${name}! I'm Alo, your tutor. Before we start climbing, I need to see where you are. You'll get ${questions.length} questions that run from core semantics up to interpreter internals, all curated by expert Python software engineers. Answer honestly, without running the code. I'll use your results to place you at the level that matches your current Python seniority, so you never waste time on what you already know.`}
          footer={
            <button onClick={() => setPhase("quiz")} className="btn btn-primary">
              I&apos;m ready
            </button>
          }
        />
        <div className="text-center">
          <CuratedBadge />
        </div>
      </motion.div>
    );
  }

  if (phase === "result" && result) {
    return <PlacementResult result={result} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <AloAvatar size={56} float={false} mood={phase === "submitting" ? "thinking" : "idle"} />
        <div className="flex-1">
          <div className="mb-1.5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted">Placement test</div>
          <ProgressPips
            states={questions.map((qq, i) =>
              i === index ? "current" : answers[qq.id] !== undefined && i < index ? "done" : "todo",
            )}
          />
        </div>
      </div>
      <AnimatePresence mode="wait">
        {q && (
          <QuestionCard
            key={q.id}
            question={q}
            index={index}
            total={questions.length}
            selected={selected}
            onSelect={(i) => setAnswers((a) => ({ ...a, [q.id]: i }))}
            disabled={phase === "submitting"}
          />
        )}
      </AnimatePresence>
      {error && (
        <p role="alert" className="rounded-xl border border-red/40 bg-red/10 px-4 py-2.5 text-sm text-red">
          {error}
        </p>
      )}
      <div className="flex justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || phase === "submitting"}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button onClick={next} disabled={selected === null || phase === "submitting"} className="btn btn-primary">
          {phase === "submitting" ? "Alo is scoring…" : isLast ? "Finish test" : "Next"}
        </button>
      </div>
    </div>
  );
}

function PlacementResult({ result }: { result: Result }) {
  const seniority = SENIORITY_BY_START_LEVEL[result.startLevel] ?? "";
  return (
    <div className="relative pt-4 text-center">
      <Confetti count={60} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-cyan">
        Placement complete · {result.score}/{result.total} correct
      </motion.div>

      <div className="relative mx-auto mt-6 grid h-64 w-64 place-items-center">
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background: "repeating-conic-gradient(from 0deg, rgba(139,92,246,0.35) 0deg 8deg, transparent 8deg 20deg)",
            maskImage: "radial-gradient(circle, black 25%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle, black 25%, transparent 70%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 12 }}
          className="relative grid h-40 w-40 place-items-center rounded-[2rem] border-4 border-gold bg-gradient-to-b from-[#ffe08a] via-gold to-gold-2 shadow-[0_0_60px_rgba(255,201,74,0.7)]"
        >
          <div className="text-[#3a1d00]">
            <div className="font-display text-sm font-bold uppercase tracking-widest">Level</div>
            <div className="font-display text-7xl font-bold leading-none">{result.startLevel}</div>
          </div>
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-4 font-display text-3xl font-bold sm:text-4xl"
      >
        {result.levelTitle}
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-1 text-muted">
        Your current seniority: <span className="font-semibold text-gold">{seniority}</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="panel mx-auto mt-8 max-w-md p-5 text-left"
      >
        <div className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted">Breakdown by level</div>
        <div className="space-y-2">
          {result.perLevel.map((l) => (
            <div key={l.level} className="flex items-center gap-3 text-sm">
              <span className="w-16 font-display font-semibold">Level {l.level}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className={`h-full rounded-full ${l.correct === l.total ? "bg-green" : l.correct > 0 ? "bg-gold" : "bg-red/70"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(l.correct / l.total) * 100}%` }}
                  transition={{ delay: 1.3 + l.level * 0.1, duration: 0.6 }}
                />
              </div>
              <span className="w-10 text-right tabular-nums text-muted">
                {l.correct}/{l.total}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mx-auto mt-8 max-w-2xl text-left">
        <AloSpeech
          size={100}
          mood="happy"
          text={
            result.needsPass
              ? `${result.startLevel > 1 ? `Impressive! You've earned your place at Level ${result.startLevel}.` : "Great start! Level 1 is where we'll build the foundations senior interviewers test first."} Your path is ready. The Interview Pass unlocks Level ${result.startLevel} and every level after it, with one payment, and I'll be with you on every question.`
              : result.startLevel > 1
                ? `Impressive! You've earned your place at Level ${result.startLevel}. I've marked the earlier levels as cleared, so you can jump straight to the content that will move you forward. Ready to climb?`
                : "Great start! Level 1 is where we'll build the rock-solid foundations senior interviewers test first. Clear it and the next level unlocks. I'll be with you on every question."
          }
          footer={
            result.needsPass ? (
              <div className="flex flex-wrap gap-3">
                <Link href={`/pricing?level=${result.startLevel}`} className="btn btn-primary">
                  Unlock level {result.startLevel}
                </Link>
                <Link href="/map" className="btn btn-secondary">
                  See the map
                </Link>
              </div>
            ) : (
              <Link href="/map" className="btn btn-primary">
                Enter the level map
              </Link>
            )
          }
        />
      </motion.div>
    </div>
  );
}
