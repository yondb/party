export default function FeedLoading() {
  return (
    <div className="animate-pulse space-y-5 pb-6 pt-1" aria-busy aria-label="Loading feed">
      <div className="h-9 w-56 max-w-[70%] rounded-md bg-[var(--bg-surface-3)]" />
      <div className="-mx-1 flex gap-2 overflow-hidden px-1">
        <div className="h-11 w-24 shrink-0 rounded-full bg-[var(--bg-surface-3)]" />
        <div className="h-11 w-28 shrink-0 rounded-full bg-[var(--bg-surface-2)]" />
        <div className="h-11 w-32 shrink-0 rounded-full bg-[var(--bg-surface-2)]" />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="h-11 w-28 rounded-full bg-[var(--bg-surface-2)]" />
        <div className="h-11 w-36 rounded-full bg-[var(--bg-surface-2)]" />
      </div>
      <ul className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <li key={i} className="card p-5">
            <div className="flex gap-4">
              <div className="h-14 w-14 shrink-0 rounded-[var(--radius-md)] bg-[var(--bg-surface-3)]" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-6 w-[62%] max-w-[12rem] rounded bg-[var(--bg-surface-3)]" />
                <div className="h-4 w-full max-w-[18rem] rounded bg-[var(--bg-surface-2)]" />
                <div className="h-4 w-[78%] max-w-[14rem] rounded bg-[var(--bg-surface-2)]" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
