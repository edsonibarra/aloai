"use client";
import { motion } from "framer-motion";
import { useId } from "react";

export type AloMood = "idle" | "happy" | "thinking" | "encouraging";

type Props = {
  size?: number;
  mood?: AloMood;
  talking?: boolean;
  float?: boolean;
  className?: string;
};

/** Alo, the AloAI tutor: an illustrated, animated SVG character. */
export function AloAvatar({ size = 160, mood = "idle", talking = false, float = true, className }: Props) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${name}-${uid}`;

  const pupilOffset = mood === "thinking" ? { x: 2.5, y: -3 } : { x: 0, y: 0 };

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size * 1.1 }}
      animate={float ? { y: [0, -6, 0] } : undefined}
      transition={float ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
      role="img"
      aria-label="Alo, your AI tutor"
    >
      <svg viewBox="0 0 200 220" width="100%" height="100%" overflow="visible">
        <defs>
          <radialGradient id={id("glow")} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#3ee8ff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3ee8ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id("hair")} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#5b2bd6" />
            <stop offset="55%" stopColor="#8b3fe0" />
            <stop offset="100%" stopColor="#ff5fa2" />
          </linearGradient>
          <linearGradient id={id("hairFront")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7340f0" />
            <stop offset="100%" stopColor="#4a1fb8" />
          </linearGradient>
          <linearGradient id={id("skin")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6cdb0" />
            <stop offset="100%" stopColor="#eab08e" />
          </linearGradient>
          <linearGradient id={id("jacket")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#33246e" />
            <stop offset="100%" stopColor="#170f36" />
          </linearGradient>
          <radialGradient id={id("iris")} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#9ff6ff" />
            <stop offset="55%" stopColor="#3ec5ff" />
            <stop offset="100%" stopColor="#6a3df0" />
          </radialGradient>
        </defs>

        {/* aura */}
        <motion.circle
          cx="100"
          cy="105"
          r="98"
          fill={`url(#${id("glow")})`}
          animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "100px 105px" }}
        />

        {/* back hair */}
        <path
          d="M46 98 C36 38 164 38 154 98 L162 176 C156 194 134 194 128 176 L72 176 C66 194 44 194 38 176 Z"
          fill={`url(#${id("hair")})`}
        />

        {/* body / jacket */}
        <path d="M34 220 C34 182 66 166 100 166 C134 166 166 182 166 220 Z" fill={`url(#${id("jacket")})`} />
        <path d="M78 168 L100 196 L122 168" fill="none" stroke="#3ee8ff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M66 172 C72 186 74 202 72 220 M134 172 C128 186 126 202 128 220" stroke="#4a3896" strokeWidth="2" fill="none" />
        {/* badge */}
        <g transform="translate(132 196)">
          <circle r="9" fill="#120b2c" stroke="#ffc94a" strokeWidth="1.5" />
          <path d="M-3.5 -3 L-6 0 L-3.5 3 M3.5 -3 L6 0 L3.5 3" stroke="#ffc94a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>

        {/* neck */}
        <path d="M88 136 L88 166 Q100 174 112 166 L112 136 Z" fill="#dc9f7c" />

        {/* face */}
        <path d="M62 96 C62 58 138 58 138 96 C138 130 118 152 100 152 C82 152 62 130 62 96 Z" fill={`url(#${id("skin")})`} />

        {/* side locks */}
        <path d="M64 84 C52 112 56 142 68 160 C68 136 68 112 74 94 Z" fill={`url(#${id("hair")})`} />
        <path d="M136 84 C148 112 144 142 132 160 C132 136 132 112 126 94 Z" fill={`url(#${id("hair")})`} />

        {/* blush */}
        <ellipse cx="78" cy="122" rx="8" ry="4.5" fill="#ff7aa8" opacity="0.35" />
        <ellipse cx="122" cy="122" rx="8" ry="4.5" fill="#ff7aa8" opacity="0.35" />

        {/* eyebrows */}
        <motion.g
          animate={{ y: mood === "thinking" ? -2.5 : mood === "encouraging" ? -1 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <path
            d={mood === "encouraging" ? "M76 90 Q85 86 93 90" : "M76 91 Q85 85 93 89"}
            stroke="#3a1a7a"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={mood === "encouraging" ? "M107 90 Q115 86 124 90" : "M107 89 Q115 85 124 91"}
            stroke="#3a1a7a"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
        </motion.g>

        {/* eyes */}
        {mood === "happy" ? (
          <g stroke="#2a1160" strokeWidth="3.2" fill="none" strokeLinecap="round">
            <path d="M77 106 Q85 97 93 106" />
            <path d="M107 106 Q115 97 123 106" />
          </g>
        ) : (
          <motion.g
            animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
            style={{ transformOrigin: "100px 104px" }}
          >
            {[85, 115].map((cx) => (
              <g key={cx}>
                <ellipse cx={cx} cy="105" rx="7.5" ry="9" fill="#fff" />
                <motion.g animate={pupilOffset} transition={{ type: "spring", stiffness: 120, damping: 12 }}>
                  <ellipse cx={cx} cy="106" rx="5.6" ry="7" fill={`url(#${id("iris")})`} />
                  <ellipse cx={cx} cy="107" rx="2.6" ry="3.4" fill="#1b0b45" />
                  <circle cx={cx - 2} cy="103" r="1.8" fill="#fff" />
                </motion.g>
                <path
                  d={`M${cx - 9} 101 Q${cx} 92 ${cx + 9} 101`}
                  stroke="#2a1160"
                  strokeWidth="2.6"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </motion.g>
        )}

        {/* nose */}
        <path d="M100 113 Q98 119 101 120" stroke="#c98463" strokeWidth="1.6" fill="none" strokeLinecap="round" />

        {/* mouth */}
        {talking ? (
          <motion.ellipse
            cx="100"
            cy="132"
            rx="6"
            ry="5"
            fill="#a8324f"
            style={{ transformOrigin: "100px 132px" }}
            animate={{ scaleY: [0.3, 0.9, 0.4, 1, 0.3] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        ) : mood === "thinking" ? (
          <ellipse cx="103" cy="133" rx="3" ry="2.4" fill="#a8324f" />
        ) : (
          <path
            d={mood === "happy" ? "M89 128 Q100 141 111 128 Z" : "M91 130 Q100 137 109 130"}
            stroke="#a8324f"
            strokeWidth="2.6"
            fill={mood === "happy" ? "#c2405f" : "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* front hair / bangs */}
        <path
          d="M56 102 C48 50 92 34 114 42 C144 50 154 78 144 106 C138 88 128 74 112 66 C114 78 104 86 94 88 C97 78 92 70 88 68 C80 82 68 90 56 102 Z"
          fill={`url(#${id("hairFront")})`}
        />
        <path d="M84 50 C96 44 112 44 124 52" stroke="#b18cff" strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round" />

        {/* headset */}
        <path d="M54 96 C50 30 150 30 146 96" stroke="#22184a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M58 92 C56 40 144 40 142 92" stroke="#3ee8ff" strokeWidth="1.5" fill="none" opacity="0.7" />
        <rect x="46" y="88" width="14" height="28" rx="7" fill="#22184a" stroke="#3ee8ff" strokeWidth="1.5" />
        <rect x="140" y="88" width="14" height="28" rx="7" fill="#22184a" stroke="#3ee8ff" strokeWidth="1.5" />
        <path d="M54 114 C58 138 72 142 86 138" stroke="#22184a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <motion.circle
          cx="88"
          cy="137.5"
          r="3.6"
          fill="#3ee8ff"
          animate={{ opacity: talking ? [1, 0.4, 1] : 1 }}
          transition={{ duration: 0.5, repeat: talking ? Infinity : 0 }}
        />
      </svg>
    </motion.div>
  );
}
