"use client";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { Coin } from "./Coin";

export function CreditCounter({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  const prev = useRef(value);
  const bumped = value > prev.current;

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: "easeOut", delay: bumped ? 0.6 : 0 });
    prev.current = value;
    return () => controls.stop();
  }, [value, mv, bumped]);

  return (
    <motion.div
      key={value}
      data-credit-target
      initial={bumped ? { scale: 1 } : false}
      animate={bumped ? { scale: [1, 1, 1.25, 1] } : undefined}
      transition={{ duration: 1.1, times: [0, 0.5, 0.7, 1] }}
      className="flex items-center gap-2 rounded-full border border-gold/40 bg-gradient-to-b from-[#3a2a10]/80 to-[#1d1408]/80 py-1 pl-1 pr-4 shadow-[0_0_24px_-6px_rgba(255,201,74,0.6)]"
      aria-label={`${value} credits`}
    >
      <Coin size={28} />
      <motion.span className="font-display text-lg font-bold tabular-nums text-gold">{rounded}</motion.span>
    </motion.div>
  );
}
