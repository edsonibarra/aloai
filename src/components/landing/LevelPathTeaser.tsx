"use client";
import { motion } from "framer-motion";

/** Decorative preview of the locked level path. */
export function LevelPathTeaser() {
  return (
    <div className="relative mx-auto flex max-w-3xl items-center justify-between px-2">
      <div aria-hidden className="absolute left-8 right-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-gold via-violet/40 to-violet/10" />
      {[1, 2, 3, 4, 5].map((n, i) => {
        const open = n === 1;
        return (
          <motion.div
            key={n}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 260, damping: 16 }}
            className={`relative grid h-14 w-14 place-items-center rounded-2xl border-2 font-display text-xl font-bold sm:h-20 sm:w-20 sm:text-2xl ${
              open
                ? "border-gold bg-gradient-to-b from-gold to-gold-2 text-[#2a1600] shadow-[0_0_30px_rgba(255,201,74,0.6)]"
                : "border-line bg-panel-solid text-muted"
            }`}
          >
            {open ? (
              n
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Locked">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            )}
            {open && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-2xl border-2 border-gold"
                animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
