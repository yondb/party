"use client";

import { motion } from "framer-motion";

type ExpBarProps = {
  progress: number;
  label?: string;
  className?: string;
};

export function ExpBar({ progress, label, className = "" }: ExpBarProps) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <div className="mb-1 flex justify-between text-xs text-[var(--text-muted)]">
          <span>{label}</span>
        </div>
      ) : null}
      <div
        className="h-1.5 overflow-hidden rounded border border-[var(--gold-dim)]"
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
