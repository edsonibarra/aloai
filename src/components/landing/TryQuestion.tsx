"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AloAvatar } from "../AloAvatar";
import { CodeBlock } from "../CodeBlock";
import { Coin } from "../Coin";
import { RichText } from "../RichText";

const OPTIONS = ["[]", "[2]", "[1, 3]", "RuntimeError"];
const ANSWER = 1;

/** A one-question taste of the game on the landing page. */
export function TryQuestion() {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === ANSWER;

  return (
    <div className="panel grid gap-6 p-5 sm:p-8 md:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-cyan">Warm-up · What does this print?</div>
        <CodeBlock code={"a = [1, 2, 3]\nfor x in a:\n    a.remove(x)\nprint(a)"} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {OPTIONS.map((opt, i) => {
            const state = picked === null ? "idle" : i === ANSWER ? "right" : i === picked ? "wrong" : "dim";
            return (
              <motion.button
                key={opt}
                whileHover={picked === null ? { y: -2 } : undefined}
                whileTap={picked === null ? { scale: 0.97 } : undefined}
                onClick={() => picked === null && setPicked(i)}
                disabled={picked !== null}
                className={`focus-ring rounded-xl border px-4 py-3 text-left font-mono text-sm transition-colors ${
                  state === "right"
                    ? "border-green bg-green/15 text-green"
                    : state === "wrong"
                      ? "border-red bg-red/15 text-red"
                      : state === "dim"
                        ? "border-line text-muted opacity-60"
                        : "border-line bg-white/[0.03] hover:border-violet-2"
                }`}
              >
                <span className="mr-2 font-display text-muted">{String.fromCharCode(65 + i)}</span>
                {opt}
              </motion.button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-center">
        <AloAvatar size={150} mood={picked === null ? "idle" : correct ? "happy" : "encouraging"} />
        <AnimatePresence mode="wait">
          <motion.div
            key={picked === null ? "q" : correct ? "y" : "n"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm leading-relaxed text-ink/90"
          >
            {picked === null ? (
              "Go on, pick one. Senior candidates spot the trap in seconds."
            ) : (
              <>
                {correct && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    className="mb-2 inline-flex items-center gap-1.5 font-display text-2xl font-bold text-gold"
                  >
                    <Coin size={26} /> +10
                  </motion.div>
                )}
                <p>
                  <strong className={correct ? "text-green" : "text-pink"}>{correct ? "Nailed it!" : "Classic trap!"}</strong>{" "}
                  <RichText text="Removing items while iterating shifts the list under the iterator, so every other element is skipped. Iterate over a copy (`a[:]`) or build a new list. Interviewers love this one." />
                </p>
                <button onClick={() => setPicked(null)} className="focus-ring mt-3 rounded text-xs text-muted underline hover:text-ink">
                  Try again
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
