type StatBlockProps = {
  label: string;
  value: string | number;
};

export function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-[var(--bg-surface-2)] px-3 py-4 text-center">
      <span
        className="text-2xl font-bold tabular-nums leading-none"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
      <span
        className="mt-2 text-xs font-medium"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}
