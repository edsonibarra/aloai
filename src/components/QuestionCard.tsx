"use client";
import { motion } from "framer-motion";
import { CodeBlock } from "./CodeBlock";
import { RichText } from "./RichText";

export type PublicQuestion = { id: string; prompt: string; code: string | null; options: string[] };

type Props = {
  question: PublicQuestion;
  index: number;
  total: number;
  selected: number | null;
  onSelect: (i: number) => void;
  /** When set, the answer is revealed and options are locked. */
  reveal?: { correctIndex: number } | null;
  disabled?: boolean;
};

export function QuestionCard({ question, index, total, selected, onSelect, reveal, disabled }: Props) {
  const locked = !!reveal || disabled;
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="panel p-5 sm:p-7"
    >
      <div className="mb-3 flex items-center justify-between font-display text-xs font-semibold uppercase tracking-[0.2em]">
        <span className="text-cyan">
          Question {index + 1} / {total}
        </span>
      </div>
      <h2 className="mb-4 font-display text-xl font-semibold leading-snug sm:text-2xl">
        <RichText text={question.prompt} />
      </h2>
      {question.code && <CodeBlock code={question.code} />}
      <div className="mt-5 grid gap-3" role="radiogroup" aria-label="Answer options">
        {question.options.map((opt, i) => {
          const isSel = selected === i;
          let tone = "border-line bg-white/[0.03] hover:border-violet-2 hover:bg-violet/10";
          if (reveal) {
            if (i === reveal.correctIndex) tone = "border-green bg-green/15 text-green shadow-[0_0_24px_-8px_#3cf5a0]";
            else if (isSel) tone = "border-red bg-red/15 text-red";
            else tone = "border-line opacity-50";
          } else if (isSel) {
            tone = "border-violet-2 bg-violet/25 shadow-[0_0_24px_-6px_rgba(139,92,246,0.8)]";
          }
          return (
            <motion.button
              key={i}
              role="radio"
              aria-checked={isSel}
              disabled={locked}
              onClick={() => onSelect(i)}
              whileHover={locked ? undefined : { x: 4 }}
              whileTap={locked ? undefined : { scale: 0.98 }}
              animate={reveal && isSel && i !== reveal.correctIndex ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={`focus-ring flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${tone} ${locked ? "cursor-default" : "cursor-pointer"}`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-display text-sm font-bold ${
                  isSel && !reveal ? "bg-violet-2 text-bg" : "bg-white/5 text-muted"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="pt-0.5 font-mono text-sm leading-relaxed sm:text-[0.95rem]">
                <RichText text={opt} />
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
