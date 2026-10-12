"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CREDITS_PER_LEVEL, PASS_THRESHOLD } from "@/lib/game";
import { AloAvatar, type AloMood } from "./AloAvatar";
import { AloSpeech } from "./AloSpeech";
import { Coin } from "./Coin";
import { Confetti } from "./Confetti";
import { CreditBurst, type Reward } from "./CreditBurst";
import { CuratedBadge } from "./CuratedBadge";
import { Hud } from "./Hud";
import { ProgressPips } from "./ProgressPips";
import { QuestionCard, type PublicQuestion } from "./QuestionCard";
import { RichText } from "./RichText";

type LevelData = {
  id: number;
  title: string;
  tagline: string;
  topics: string[];
  questions: PublicQuestion[];
  completed: boolean;
  bestScore: number;
  isFinal: boolean;
};

type AnswerResult = {
  correct: boolean;
  correctIndex: number;
  explanation: string;
  questionCredits: number;
  totalCredits: number;
  levelResult: {
    score: number;
    total: number;
    passed: boolean;
    levelCredits: number;
    unlockedLevel: number | null;
    isFinalLevel: boolean;
  } | null;
};

type Phase = "intro" | "quiz" | "result";

export function LevelPlay({ user, level }: { user: { name: string; credits: number }; level: LevelData }) {
  const [credits, setCredits] = useState(user.credits);
  const [phase, setPhase] = useState<Phase>("intro");
  const [intro, setIntro] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answer, setAnswer] = useState<AnswerResult | null>(null);
  const [history, setHistory] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<{ text: string | null; loading: boolean }>({ text: null, loading: false });
  const [reward, setReward] = useState<Reward | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rewardId = useRef(0);

  const question = level.questions[index];
  const isLast = index === level.questions.length - 1;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/levels/${level.id}/intro`)
      .then((r) => r.json())
      .then((d) => !cancelled && setIntro(d.text ?? null))
      .catch(() => !cancelled && setIntro(`Welcome to Level ${level.id}: ${level.title}. Let's go!`));
    return () => {
      cancelled = true;
    };
  }, [level.id, level.title]);

  async function startAttempt() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/levels/${level.id}/attempt`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAttemptId(data.attemptId);
      setIndex(0);
      setSelected(null);
      setAnswer(null);
      setHistory([]);
      setFeedback({ text: null, loading: false });
      setPhase("quiz");
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Could not start the level");
    } finally {
      setBusy(false);
    }
  }

  async function lockIn() {
    if (selected === null || !attemptId || !question) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/levels/${level.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, questionId: question.id, choice: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const result = data as AnswerResult;
      setAnswer(result);
      setHistory((h) => [...h, result.correct]);
      setCredits(result.totalCredits - (result.levelResult?.levelCredits ?? 0));
      if (result.questionCredits > 0) {
        setReward({ id: ++rewardId.current, amount: result.questionCredits, label: "Alo awards you credits!" });
      }
      // Alo's personalised feedback arrives separately so the reveal is instant.
      setFeedback({ text: null, loading: true });
      fetch("/api/alo/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, questionId: question.id }),
      })
        .then((r) => r.json())
        .then((d) => setFeedback({ text: d.text ?? result.explanation, loading: false }))
        .catch(() => setFeedback({ text: result.explanation, loading: false }));
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Could not submit your answer");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (!answer) return;
    if (answer.levelResult) {
      const { levelCredits } = answer.levelResult;
      setPhase("result");
      if (levelCredits > 0) {
        setTimeout(() => {
          setReward({ id: ++rewardId.current, amount: levelCredits, label: "Level bonus from Alo!" });
          setCredits(answer.totalCredits);
        }, 1500);
      } else {
        setCredits(answer.totalCredits);
      }
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswer(null);
    setFeedback({ text: null, loading: false });
  }

  const clearReward = useCallback(() => setReward(null), []);

  const pipStates = level.questions.map((_, i) =>
    i < history.length ? (history[i] ? "done-right" : "done-wrong") : i === index ? "current" : "todo",
  ) as ("done-right" | "done-wrong" | "current" | "todo")[];

  const aloMood: AloMood = !answer ? "idle" : answer.correct ? "happy" : "encouraging";

  return (
    <>
      <Hud name={user.name} credits={credits} />
      <CreditBurst reward={reward} onDone={clearReward} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.section key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Link href="/map" className="focus-ring rounded text-sm text-muted hover:text-ink">
                ← Level map
              </Link>
              <div className="mt-4 text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="inline-grid h-20 w-20 place-items-center rounded-3xl border-2 border-gold bg-gradient-to-b from-[#ffe08a] via-gold to-gold-2 font-display text-4xl font-bold text-[#2a1600] shadow-[0_0_40px_rgba(255,201,74,0.6)]"
                >
                  {level.id}
                </motion.div>
                <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{level.title}</h1>
                <p className="mt-2 text-muted">{level.tagline}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {level.topics.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-muted">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-pink">
                  Why this level matters
                </div>
                <AloSpeech
                  size={130}
                  text={intro}
                  loading={intro === null}
                  loadingLabel="Alo is preparing your briefing"
                  footer={
                    <div className="flex flex-wrap items-center gap-4">
                      <button onClick={startAttempt} disabled={busy} className="btn btn-primary">
                        {level.completed ? "Replay level" : "Start level"}
                      </button>
                      <span className="text-sm text-muted">
                        {level.questions.length} questions · pass with {PASS_THRESHOLD}+
                        {level.completed && ` · best ${level.bestScore}/${level.questions.length}`}
                      </span>
                    </div>
                  }
                />
              </div>
              {error && <ErrorNote message={error} />}
              <div className="mt-8 text-center">
                <CuratedBadge />
              </div>
            </motion.section>
          )}

          {phase === "quiz" && question && (
            <motion.section key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <ProgressPips
                states={pipStates}
                label={
                  <span className="font-display text-sm font-bold text-muted">
                    L{level.id}
                  </span>
                }
              />
              <AnimatePresence mode="wait">
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  total={level.questions.length}
                  selected={selected}
                  onSelect={setSelected}
                  reveal={answer ? { correctIndex: answer.correctIndex } : null}
                  disabled={busy}
                />
              </AnimatePresence>

              {error && <ErrorNote message={error} />}

              {!answer ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <AloAvatar size={44} float={false} mood={selected === null ? "thinking" : "idle"} />
                    {selected === null ? "Take your time. Think it through." : "Confident? Lock it in."}
                  </div>
                  <button onClick={lockIn} disabled={selected === null || busy} className="btn btn-primary">
                    {busy ? "Checking…" : "Lock in"}
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 font-display text-lg font-bold ${
                      answer.correct ? "border-green/50 bg-green/10 text-green" : "border-red/50 bg-red/10 text-red"
                    }`}
                  >
                    {answer.correct ? "Correct!" : "Not quite."}
                    {answer.correct && answer.questionCredits > 0 && (
                      <span className="ml-auto flex items-center gap-1.5 text-gold">
                        <Coin size={22} /> +{answer.questionCredits}
                      </span>
                    )}
                    {answer.correct && answer.questionCredits === 0 && (
                      <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-muted">
                        Credits already earned
                      </span>
                    )}
                  </div>
                  <AloSpeech
                    size={100}
                    mood={aloMood}
                    text={feedback.text}
                    loading={feedback.loading}
                    loadingLabel="Alo is reviewing your answer"
                  />
                  <details className="panel group p-4">
                    <summary className="focus-ring flex cursor-pointer list-none items-center gap-2 rounded font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                        <path d="M12 2l2.6 5.6 6.1.7-4.5 4.2 1.2 6.1L12 15.6 6.6 18.6l1.2-6.1L3.3 8.3l6.1-.7z" />
                      </svg>
                      Expert engineer&apos;s note
                      <span className="ml-auto text-muted transition-transform group-open:rotate-180">▾</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-ink/90">
                      <RichText text={answer.explanation} />
                    </p>
                  </details>
                  <div className="flex justify-end">
                    <button onClick={next} className="btn btn-primary">
                      {isLast ? "See results" : "Next question"}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.section>
          )}

          {phase === "result" && answer?.levelResult && (
            <LevelResultScreen
              key="result"
              level={level}
              result={answer.levelResult}
              onRetry={startAttempt}
              busy={busy}
            />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-4 rounded-xl border border-red/40 bg-red/10 px-4 py-2.5 text-sm text-red">
      {message}
    </p>
  );
}

function LevelResultScreen({
  level,
  result,
  onRetry,
  busy,
}: {
  level: LevelData;
  result: NonNullable<AnswerResult["levelResult"]>;
  onRetry: () => void;
  busy: boolean;
}) {
  const { passed, score, total, levelCredits, unlockedLevel, isFinalLevel } = result;

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative pt-4 text-center">
      {passed && <Confetti count={110} />}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`font-display text-sm font-semibold uppercase tracking-[0.3em] ${passed ? "text-gold" : "text-pink"}`}
      >
        Level {level.id} · {passed ? "Cleared" : "Not cleared yet"}
      </motion.div>

      <div className="relative mx-auto mt-4 grid h-72 w-72 place-items-center">
        {passed && (
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background: "repeating-conic-gradient(from 0deg, rgba(255,201,74,0.32) 0deg 9deg, transparent 9deg 22deg)",
              maskImage: "radial-gradient(circle, black 25%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(circle, black 25%, transparent 70%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          />
        )}
        {passed ? <Trophy /> : <AloAvatar size={200} mood="encouraging" />}
      </div>

      <motion.h1
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="font-display text-4xl font-bold sm:text-5xl"
      >
        {passed ? (isFinalLevel ? "Senior Python Master!" : "Level complete!") : "So close!"}
      </motion.h1>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <div className="panel min-w-36 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Score</div>
          <div className={`font-display text-3xl font-bold ${passed ? "text-green" : "text-pink"}`}>
            {score}/{total}
          </div>
        </div>
        {passed && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="panel min-w-36 border-gold/50 px-5 py-4 shadow-[0_0_40px_-10px_rgba(255,201,74,0.8)]"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">Level bonus</div>
            <div className="flex items-center justify-center gap-2 font-display text-3xl font-bold text-gold">
              <Coin size={30} /> {levelCredits > 0 ? `+${levelCredits}` : "Claimed"}
            </div>
          </motion.div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mx-auto mt-8 max-w-2xl text-left">
        <AloSpeech
          size={96}
          mood={passed ? "happy" : "encouraging"}
          text={
            passed
              ? levelCredits > 0
                ? isFinalLevel
                  ? `You did it! Every level cleared. Here are ${CREDITS_PER_LEVEL} credits for conquering the final level. You now think about Python the way senior interviewers hope candidates will.`
                  : `Outstanding! I'm awarding you ${CREDITS_PER_LEVEL} bonus credits for clearing ${level.title}. Level ${unlockedLevel} is now unsealed. Let's keep the streak going!`
                : `Great replay! You've already claimed this level's bonus, but that ${score}/${total} shows the knowledge is sticking.`
              : `You got ${score} of ${total}. You need ${PASS_THRESHOLD} to clear this level. Every miss shows you exactly what an interviewer might catch, so review my notes and try again. You'll get it.`
          }
          footer={
            <div className="flex flex-wrap gap-3">
              {passed && unlockedLevel ? (
                <Link href={`/level/${unlockedLevel}`} className="btn btn-primary">
                  Play level {unlockedLevel}
                </Link>
              ) : !passed ? (
                <button onClick={onRetry} disabled={busy} className="btn btn-primary">
                  Try again
                </button>
              ) : null}
              <Link href="/map" className="btn btn-secondary">
                Level map
              </Link>
            </div>
          }
        />
      </motion.div>
    </motion.section>
  );
}

function Trophy() {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className="relative h-48 w-48 drop-shadow-[0_0_40px_rgba(255,201,74,0.8)]"
      initial={{ scale: 0, y: 40, rotate: -15 }}
      animate={{ scale: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 10, delay: 0.15 }}
      aria-label="Trophy"
    >
      <defs>
        <linearGradient id="trophy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.5" stopColor="#ffc94a" />
          <stop offset="1" stopColor="#ff9f1c" />
        </linearGradient>
      </defs>
      <path d="M30 22 C14 22 12 46 34 52" stroke="#e08a00" strokeWidth="6" fill="none" />
      <path d="M90 22 C106 22 108 46 86 52" stroke="#e08a00" strokeWidth="6" fill="none" />
      <path d="M30 14 H90 V40 C90 62 76 74 60 74 C44 74 30 62 30 40 Z" fill="url(#trophy)" />
      <rect x="54" y="72" width="12" height="16" fill="#e08a00" />
      <rect x="38" y="88" width="44" height="10" rx="3" fill="url(#trophy)" />
      <rect x="32" y="98" width="56" height="10" rx="3" fill="#b86a00" />
      <path d="M60 26 l4.5 9 10 1.4 -7.2 7 1.7 9.9 -9-4.7 -9 4.7 1.7-9.9 -7.2-7 10-1.4z" fill="#fff6d6" />
      <ellipse cx="44" cy="30" rx="4" ry="10" fill="#fff" opacity="0.4" />
    </motion.svg>
  );
}
