import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";

const sizes: Record<LogoSize, { mark: number; radius: number; fontSize: number; textSize: number }> = {
  sm: { mark: 26, radius: 7, fontSize: 11, textSize: 15 },
  md: { mark: 32, radius: 9, fontSize: 13, textSize: 19 },
  lg: { mark: 40, radius: 11, fontSize: 16, textSize: 24 },
};

export function Logo({ size = "md", href = "/" }: { size?: LogoSize; href?: string }) {
  const s = sizes[size];
  const mark = (
    <svg
      width={s.mark}
      height={s.mark}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="32" height="32" rx={s.radius} fill="var(--accent)" />
      <circle cx="16" cy="13" r="5.5" fill="white" opacity="0.95" />
      <circle cx="16" cy="13" r="2.5" fill="var(--accent)" />
      <path
        d="M16 18.5C16 18.5 11 23 11 26C11 27.1 13.2 28 16 28C18.8 28 21 27.1 21 26C21 23 16 18.5 16 18.5Z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="10" cy="8" r="1.8" fill="white" opacity="0.55" />
      <circle cx="22" cy="8" r="1.8" fill="white" opacity="0.55" />
    </svg>
  );

  const wordmark = (
    <span
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: s.textSize,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "var(--text-primary)",
        lineHeight: 1,
      }}
    >
      lf<span style={{ color: "var(--accent)" }}>party</span>
    </span>
  );

  const inner = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(s.mark * 0.28),
        textDecoration: "none",
      }}
    >
      {mark}
      {wordmark}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  );
}
