"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { AloAvatar } from "./AloAvatar";
import { AloSpeech } from "./AloSpeech";
import { CuratedBadge } from "./CuratedBadge";

export type MapNode =
  | { id: number; status: "unlocked" | "completed"; title: string; tagline: string }
  | { id: number; status: "locked" };

const X = [50, 22, 50, 78, 50]; // horizontal position (%) of each node along the winding path
const ROW = 190;

export function LevelMap({ nodes, name }: { nodes: MapNode[]; name: string }) {
  const current = nodes.find((n) => n.status === "unlocked");
  const allDone = nodes.every((n) => n.status === "completed");
  const height = nodes.length * ROW;
  const pts = nodes.map((_, i) => ({ x: X[i % X.length], y: i * ROW + ROW / 2 }));
  const pathD = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const midY = (prev.y + p.y) / 2;
      return `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
    })
    .join(" ");
  const reachedIdx = nodes.reduce((acc, n, i) => (n.status !== "locked" ? i : acc), 0);

  return (
    <div>
      <AloSpeech
        size={110}
        mood={allDone ? "happy" : "idle"}
        text={
          allDone
            ? `${name}, you've cleared every level! You've worked through the full senior Python gauntlet curated by expert engineers. Walk into that interview like you own it.`
            : current && current.status !== "locked"
              ? `Welcome to the map, ${name}! Level ${current.id}, ${current.title}, is open and waiting. Clear it with at least 6 of 8 correct to unseal the next one. Every question you pass earns credits.`
              : `Welcome back, ${name}! Pick a level to continue.`
        }
      />

      <div className="relative mx-auto mt-10 max-w-xl" style={{ height }}>
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          <path d={pathD} stroke="rgba(160,130,255,0.18)" strokeWidth="10" fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          <motion.path
            d={pathD}
            stroke="url(#trail)"
            strokeWidth="6"
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: nodes.length > 1 ? reachedIdx / (nodes.length - 1) : 1 }}
            transition={{ duration: 1.4, ease: "easeInOut", delay: 0.3 }}
          />
          <path
            d={pathD}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
            strokeDasharray="2 10"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <defs>
            <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffc94a" />
              <stop offset="1" stopColor="#ff5fa2" />
            </linearGradient>
          </defs>
        </svg>

        {nodes.map((node, i) => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pts[i].x}%`, top: pts[i].y }}
          >
            <LevelNode node={node} index={i} isCurrent={current?.id === node.id} />
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <CuratedBadge />
      </div>
    </div>
  );
}

function LevelNode({ node, index, isCurrent }: { node: MapNode; index: number; isCurrent: boolean }) {
  const appear = {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { delay: 0.15 * index, type: "spring" as const, stiffness: 220, damping: 15 },
  };

  if (node.status === "locked") {
    return (
      <motion.div {...appear} className="flex flex-col items-center" aria-label={`Level ${node.id}, sealed`}>
        <div className="relative grid h-24 w-24 place-items-center rounded-[1.75rem] border-2 border-line bg-gradient-to-b from-[#1d1540] to-[#110b28] shadow-[inset_0_-6px_0_rgba(0,0,0,0.35)]">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-muted/70" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="absolute -bottom-2.5 rounded-full border border-line bg-bg px-2 font-display text-xs font-bold text-muted">?</span>
        </div>
        <div className="mt-4 rounded-lg bg-bg/75 px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-[0.25em] text-muted/70 backdrop-blur-sm">Sealed</div>
      </motion.div>
    );
  }

  const done = node.status === "completed";
  return (
    <motion.div {...appear} className="flex flex-col items-center">
      <Link
        href={`/level/${node.id}`}
        className="focus-ring group relative block rounded-[1.75rem]"
        aria-label={`Level ${node.id}: ${node.title}${done ? " (completed)" : ""}`}
      >
        {isCurrent && (
          <>
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-[1.75rem] border-2 border-gold"
              animate={{ scale: [1, 1.4], opacity: [0.9, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <div className="absolute -left-20 top-1/2 hidden -translate-y-1/2 sm:block">
              <AloAvatar size={64} mood="happy" />
            </div>
          </>
        )}
        <motion.div
          whileHover={{ y: -4, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative grid h-28 w-28 place-items-center rounded-[1.75rem] border-2 font-display ${
            done
              ? "border-green bg-gradient-to-b from-[#2fd88c] to-[#0f8f5a] text-white shadow-[inset_0_-7px_0_rgba(0,0,0,0.25),0_0_30px_-6px_#3cf5a0]"
              : "border-gold bg-gradient-to-b from-[#ffe08a] via-gold to-gold-2 text-[#2a1600] shadow-[inset_0_-7px_0_rgba(0,0,0,0.2),0_0_40px_-4px_rgba(255,201,74,0.8)]"
          }`}
        >
          <div className="text-center leading-none">
            <div className="text-[0.65rem] font-bold uppercase tracking-widest opacity-80">Level</div>
            <div className="text-5xl font-bold">{node.id}</div>
          </div>
          {done && (
            <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full border-2 border-bg bg-gold text-[#2a1600]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden>
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
          )}
        </motion.div>
      </Link>
      <div className="mt-3 w-44 rounded-xl bg-bg/75 px-2 py-1 text-center backdrop-blur-sm">
        <div className="font-display text-base font-bold leading-tight">{node.title}</div>
        <div className={`mt-0.5 text-xs font-semibold uppercase tracking-wider ${done ? "text-green" : "text-gold"}`}>
          {done ? "Cleared · replay" : "Play"}
        </div>
      </div>
    </motion.div>
  );
}
