type LevelBadgeProps = {
  level: number;
  className?: string;
  size?: "sm" | "lg";
};

export function LevelBadge({ level, className = "", size = "sm" }: LevelBadgeProps) {
  const sizing =
    size === "lg"
      ? "min-w-[2.5rem] px-2 py-1 text-base"
      : "min-w-[2rem] px-1.5 py-0.5 text-xs";
  return (<div
      className={`inline-flex items-center justify-center font-bold text-white ${sizing} ${className}`}
      style={{
        background: "var(--accent)",
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-sans)",
        boxShadow: "0 2px 6px rgba(232,130,26,0.35)",
      }}
    >
      {level}
    </div>
  );
}
