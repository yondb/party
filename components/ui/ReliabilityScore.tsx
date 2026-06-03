type ReliabilityScoreProps = {
  score: number;
  size?: number;
};

export function ReliabilityScore({ score, size = 32 }: ReliabilityScoreProps) {
  const pct = Math.round(Math.min(1, Math.max(0, score)) * 100);
  const fontSize = size >= 52 ? "1rem" : size >= 44 ? "0.875rem" : "0.75rem";
  return (<div
      className="flex items-center justify-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        border: "2px solid var(--status-open)",
        color: "var(--status-open)",
        fontSize,
        fontFamily: "var(--font-sans)",
      }}
      title={`Reliability ${pct}%`}
    >
      {pct}%
    </div>
  );
}
