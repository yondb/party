type LevelBadgeProps = {
  level: number;
  className?: string;
  /** Larger badge for profile hero */
  size?: "sm" | "lg";
};

export function LevelBadge({ level, className = "", size = "sm" }: LevelBadgeProps) {
  const sizing =
    size === "lg"
      ? "min-w-[3rem] px-2.5 py-1.5 text-xl border-2 shadow-[0_0_14px_rgba(240,192,64,0.45)]"
      : "min-w-[2.25rem] px-2 py-0.5 text-sm border shadow-[var(--shadow-glow-gold)]";
  return (
    <div
      className={`inline-flex items-center justify-center rounded border-[var(--gold-bright)] bg-[linear-gradient(180deg,#2a2210,#1a1510)] font-display font-black text-[var(--gold-bright)] ${sizing} ${className}`}
    >
      {level}
    </div>
  );
}
