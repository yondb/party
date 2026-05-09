type LevelBadgeProps = { level: number; className?: string };

export function LevelBadge({ level, className = "" }: LevelBadgeProps) {
  return (
    <div
      className={`inline-flex min-w-[2.25rem] items-center justify-center rounded border border-[var(--gold-bright)] bg-[linear-gradient(180deg,#2a2210,#1a1510)] px-2 py-0.5 font-display text-sm font-black text-[var(--gold-bright)] shadow-[var(--shadow-glow-gold)] ${className}`}
    >
      {level}
    </div>
  );
}
