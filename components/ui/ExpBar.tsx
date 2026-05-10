"use client";

import { motion } from "framer-motion";

type ExpBarProps = {
  progress: number;
  label?: string;
  className?: string;
  /** Larger label, percent readout, and track (e.g. profile) */
  comfortable?: boolean;
};

export function ExpBar({ progress, label, className = "", comfortable }: ExpBarProps) {
  const p = Math.min(1, Math.max(0, progress));
  const pct = Math.round(p * 100);
  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <div
          className={
            comfortable
              ? "mb-2.5 flex items-end justify-between gap-3 text-lg leading-snug text-[var(--text-secondary)] sm:text-xl"
              : "mb-1 flex justify-between text-sm text-[var(--text-muted)]"
          }
        >
          <span className={comfortable ? "min-w-0 flex-1 tracking-wide" : ""}>{label}</span>
          {comfortable ? (
            <span className="shrink-0 font-display text-xl font-bold tabular-nums text-[var(--gold-bright)] sm:text-2xl">
              {pct}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className={`overflow-hidden rounded border border-[var(--gold-dim)] ${comfortable ? "h-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.45)]" : "h-2"}`}
        style={{ background: "var(--exp-bar-bg)" }}
      >
        <motion.div
          className="h-full rounded-sm"
          style={{
            background:
              "linear-gradient(90deg, #8a6420, #f0c040, #8a6420)",
            boxShadow: "0 0 8px var(--exp-glow)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${p * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
