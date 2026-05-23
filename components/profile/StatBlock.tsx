type StatBlockProps = {
  label: string;
  value: string | number;
};

export function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="card flex flex-col items-center justify-center px-3 py-4 text-center">
      <span
        className="text-2xl font-bold tabular-nums leading-none"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
      <span
        className="mt-2 text-[0.65rem] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}
