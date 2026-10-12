"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#ffc94a", "#3ee8ff", "#ff5fa2", "#8b5cf6", "#3cf5a0"];

export function Confetti({ count = 80 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i % 20) * 0.06,
        duration: 2.4 + ((i * 13) % 10) / 6,
        rotate: (i * 53) % 360,
        color: COLORS[i % COLORS.length],
        w: 6 + (i % 4) * 2,
      })),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block rounded-sm"
          style={{ left: `${p.left}%`, width: p.w, height: p.w * 1.6, background: p.color }}
          initial={{ y: -40, rotate: p.rotate, opacity: 1 }}
          animate={{ y: "105vh", rotate: p.rotate + 540, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
