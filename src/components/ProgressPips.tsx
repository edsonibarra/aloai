import type { ReactNode } from "react";

type PipState = "done-right" | "done-wrong" | "done" | "current" | "todo";

export function ProgressPips({ states, label }: { states: PipState[]; label?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {label}
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {states.map((s, i) => (
          <span
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${
              s === "done-right"
                ? "bg-green shadow-[0_0_10px_#3cf5a0]"
                : s === "done-wrong"
                  ? "bg-red/80"
                  : s === "done"
                    ? "bg-violet-2"
                    : s === "current"
                      ? "animate-pulse bg-cyan/70"
                      : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
