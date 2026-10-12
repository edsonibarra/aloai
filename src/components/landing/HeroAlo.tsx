"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AloAvatar } from "../AloAvatar";

const LINES = [
  "Hi, I'm Alo! I'll get you interview-ready for senior Python roles.",
  "Every question here was curated by expert Python software engineers.",
  "Before each level, I'll tell you exactly why interviewers care about it.",
  "Pass questions, clear levels, and I'll shower you with credits.",
];

export function HeroAlo() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % LINES.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
      <div className="panel relative z-10 mb-2 min-h-[92px] w-full max-w-sm p-4 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-ink/95"
          >
            {LINES[i]}
          </motion.p>
        </AnimatePresence>
        <span aria-hidden className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-line bg-panel-solid" />
      </div>
      <div className="relative">
        {/* orbiting rings */}
        <motion.div
          aria-hidden
          className="absolute inset-[-8%] rounded-full border border-cyan/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-cyan shadow-[0_0_12px_#3ee8ff]" />
        </motion.div>
        <motion.div
          aria-hidden
          className="absolute inset-[4%] rounded-full border border-dashed border-violet/40"
          animate={{ rotate: -360 }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute -bottom-1.5 left-1/3 h-2.5 w-2.5 rounded-full bg-pink shadow-[0_0_12px_#ff5fa2]" />
        </motion.div>
        <AloAvatar size={300} mood={i === 3 ? "happy" : "idle"} talking />
      </div>
    </div>
  );
}
