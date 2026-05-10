/** Small stroke icons for bottom nav — clearer than single letters on large phones. */

function stroke(active: boolean) {
  return active ? "var(--gold-bright)" : "var(--gold-mid)";
}

export function BottomIconFeed({ active }: { active: boolean }) {
  const s = stroke(active);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path d="M4 5h16v3H4V5zM4 10.5h10v3H4v-3zM4 16h14v3H4v-3z" stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function BottomIconMap({ active }: { active: boolean }) {
  const s = stroke(active);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10z"
        stroke={s}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" fill={s} />
    </svg>
  );
}

export function BottomIconQuest({ active }: { active: boolean }) {
  const s = stroke(active);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="9" stroke={s} strokeWidth="1.5" />
      <path d="M12 8v8M8 12h8" stroke={s} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function BottomIconProfile({ active }: { active: boolean }) {
  const s = stroke(active);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <circle cx="12" cy="9" r="3.25" stroke={s} strokeWidth="1.5" />
      <path
        d="M6.5 19.5c.6-2.8 2.6-4.5 5.5-4.5s4.9 1.7 5.5 4.5"
        stroke={s}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
