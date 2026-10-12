"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { AloAvatar, type AloMood } from "./AloAvatar";
import { RichText } from "./RichText";

type Props = {
  text: string | null;
  loading?: boolean;
  loadingLabel?: string;
  mood?: AloMood;
  size?: number;
  layout?: "row" | "stack";
  footer?: React.ReactNode;
};

/** Alo with a speech bubble. Text types out while she "talks". */
export function AloSpeech({
  text,
  loading = false,
  loadingLabel = "Alo is thinking",
  mood = "idle",
  size = 120,
  layout = "row",
  footer,
}: Props) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (!text) return;
    if (reduce) {
      setShown(text.length);
      return;
    }
    const step = Math.max(1, Math.round(text.length / 160));
    const timer = setInterval(() => {
      setShown((n) => {
        if (n + step >= text.length) {
          clearInterval(timer);
          return text.length;
        }
        return n + step;
      });
    }, 18);
    return () => clearInterval(timer);
  }, [text, reduce]);

  const typing = !!text && shown < text.length;
  const visible = text ? text.slice(0, shown) : "";

  return (
    <div
      className={`flex gap-3 sm:gap-4 ${
        layout === "row" ? "flex-col items-center sm:flex-row sm:items-start" : "flex-col items-center"
      }`}
    >
      {/* On phones Alo sits above the bubble at a compact size */}
      <div className="shrink-0 max-sm:[&>div]:!h-[99px] max-sm:[&>div]:!w-[90px]">
        <AloAvatar size={size} mood={loading ? "thinking" : mood} talking={typing} />
      </div>
      <motion.div
        layout
        className={`panel relative w-full min-w-0 flex-1 p-4 sm:p-5 ${layout === "row" ? "sm:mt-2 sm:w-auto" : ""}`}
      >
        <span
          aria-hidden
          className={`absolute h-4 w-4 border-line bg-panel-solid ${
            layout === "row"
              ? "-top-2 left-1/2 -translate-x-1/2 rotate-[135deg] border-b border-l sm:-left-2 sm:top-8 sm:translate-x-0 sm:rotate-45"
              : "-top-2 left-1/2 -translate-x-1/2 rotate-[135deg] border-b border-l"
          }`}
        />
        <div className="mb-1.5 flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
          Alo · AI tutor
        </div>
        <AnimatePresence mode="wait">
          {loading || !text ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-muted"
              aria-live="polite"
            >
              {loadingLabel}
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-violet-2"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
            </motion.div>
          ) : (
            <motion.p
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="leading-relaxed text-ink/95"
              aria-live="polite"
            >
              <RichText text={visible} />
              {typing && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-cyan align-middle" />}
            </motion.p>
          )}
        </AnimatePresence>
        {footer && !loading && text && !typing && <div className="mt-4">{footer}</div>}
      </motion.div>
    </div>
  );
}
