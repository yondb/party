"use client";

import { motion } from "framer-motion";

type ExpBarProps = {
  progress: number;
  label?: string;
  className?: string;
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
              ? "mb-2 flex items-end justify-between gap-3 text-sm text-[var(--text-secondary)]"
              : "mb-1 flex justify-between text-sm text-[var(--text-muted)]"
          }
        >
          <span className={comfortable ? "min-w-0 flex-1" : ""}>{label}</span>
          {comfortable ? (
            <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: "var(--accent)" }}>
              {pct}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className={`overflow-hidden ${comfortable ? "h-3" : "h-2"}`}
        style={{
          background: "var(--bg-surface-2)",
          borderRadius: "var(--radius-full)",
        }}
      >
        <motion.div
          className="h-full"
          style={{
            background: "var(--accent)",
            borderRadius: "var(--radius-full)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${p * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
