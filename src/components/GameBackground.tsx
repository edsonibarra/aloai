"use client";
import { motion } from "framer-motion";

const GLYPHS = ["def", "yield", "lambda", "async", "await", "__init__", "{ }", ">>>", "@cache", "self", "*args", "**kw", "import", "with", "GIL", "MRO"];

/** Arcade backdrop: nebula glows, a scrolling perspective grid and drifting Python glyphs. */
export function GameBackground({ glyphs = true }: { glyphs?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(139,92,246,0.28),transparent_55%),radial-gradient(ellipse_at_85%_25%,rgba(62,232,255,0.14),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(255,95,162,0.16),transparent_55%)]" />
      <div className="grid-floor" />
      {glyphs &&
        GLYPHS.map((g, i) => (
          <motion.span
            key={g}
            className="absolute font-mono text-sm font-semibold text-violet-2/25 sm:text-base"
            style={{ left: `${(i * 61) % 96}%`, top: `${(i * 37) % 80 + 4}%` }}
            animate={{ y: [0, -24, 0], opacity: [0.25, 0.7, 0.25] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          >
            {g}
          </motion.span>
        ))}
    </div>
  );
}
