export default function FeedLoading() {
  return (
    <div className="animate-pulse space-y-6 pb-6" aria-busy aria-label="Loading feed">
      <div className="h-44 rounded-[var(--radius-2xl)] bg-[var(--bg-surface-2)]" />
      <div className="flex gap-2">
        <div className="chip h-9 w-20 bg-[var(--bg-surface-2)]" />
        <div className="chip h-9 w-24 bg-[var(--bg-surface-2)]" />
        <div className="chip h-9 w-28 bg-[var(--bg-surface-2)]" />
      </div>
      <ul className="flex flex-col gap-5">
        {[0, 1, 2].map((i) => (
          <li key={i} className="floating-card overflow-hidden">
            <div className="h-20 bg-[var(--bg-surface-2)]" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-2/3 rounded-lg bg-[var(--bg-surface-3)]" />
              <div className="h-4 w-1/2 rounded-lg bg-[var(--bg-surface-2)]" />
              <div className="h-10 w-full rounded-2xl bg-[var(--bg-surface-2)]" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
