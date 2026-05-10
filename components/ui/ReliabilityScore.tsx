type ReliabilityScoreProps = {
  /** 0–1 stored in DB; displayed as percent */
  score: number;
  size?: number;
};

export function ReliabilityScore({ score, size = 32 }: ReliabilityScoreProps) {
  const pct = Math.round(Math.min(1, Math.max(0, score)) * 100);
  const color =
    pct >= 90 ? "var(--status-open)" : pct >= 70 ? "var(--status-pending)" : "var(--status-full)";
  const fontClass = size >= 52 ? "text-base" : size >= 44 ? "text-sm" : "text-xs";
  return (
    <div
      className={`flex items-center justify-center rounded-full font-display font-bold ${fontClass}`}
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        color,
        boxShadow: `0 0 8px color-mix(in srgb, ${color} 50%, transparent)`,
      }}
      title={`Reliability ${pct}%`}
    >
      {pct}
    </div>
  );
}
