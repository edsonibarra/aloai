"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Coin } from "./Coin";

export type Reward = { id: number; amount: number; label: string };

/** Full-screen reward moment: shining rays, a big coin, "+N" and coins flying to the HUD counter. */
export function CreditBurst({ reward, onDone }: { reward: Reward | null; onDone: () => void }) {
  useEffect(() => {
    if (!reward) return;
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [reward, onDone]);

  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          key={reward.id}
          className="pointer-events-none fixed inset-0 z-50 grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          role="status"
          aria-live="assertive"
        >
          <div className="absolute inset-0 bg-bg/40 backdrop-blur-[2px]" />
          <div className="relative grid place-items-center">
            <motion.div
              className="absolute h-[420px] w-[420px] rounded-full"
              style={{
                background:
                  "repeating-conic-gradient(from 0deg, rgba(255,201,74,0.28) 0deg 10deg, transparent 10deg 24deg)",
                maskImage: "radial-gradient(circle, black 20%, transparent 68%)",
                WebkitMaskImage: "radial-gradient(circle, black 20%, transparent 68%)",
              }}
              initial={{ scale: 0.2, rotate: 0 }}
              animate={{ scale: 1, rotate: 90 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0, rotateY: [0, 360] }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="drop-shadow-[0_0_40px_rgba(255,201,74,0.8)]"
            >
              <Coin size={120} />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 14 }}
              className="mt-3 text-center"
            >
              <div className="text-gold-gradient font-display text-6xl font-bold drop-shadow-[0_4px_0_#7a4300]">+{reward.amount}</div>
              <div className="mt-1 font-display text-sm font-semibold uppercase tracking-[0.2em] text-ink">{reward.label}</div>
            </motion.div>
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
                  animate={{
                    x: [0, Math.cos(angle) * 150, 520],
                    y: [0, Math.sin(angle) * 150, -420],
                    scale: [0.4, 1, 0.5],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 1.6, delay: 0.25 + i * 0.03, times: [0, 0.4, 1], ease: "easeInOut" }}
                >
                  <Coin size={26} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
