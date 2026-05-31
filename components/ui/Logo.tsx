import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";

const sizes: Record<LogoSize, { box: number; lf: string; party: string; gap: string }> = {
  sm: { box: 28, lf: "text-base", party: "text-base", gap: "gap-1.5" },
  md: { box: 34, lf: "text-xl", party: "text-xl", gap: "gap-2" },
  lg: { box: 42, lf: "text-2xl", party: "text-2xl", gap: "gap-2.5" },
};

function LogoMark({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[22%] bg-graphite shadow-[0_2px_8px_rgba(15,15,17,0.18)]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="absolute inset-0 bg-gradient-to-br from-graphite-soft to-graphite" />
      <span className="absolute -right-1 -top-1 size-[45%] rounded-full bg-honey-400/25 blur-sm" />
      <svg
        viewBox="0 0 24 24"
        className="relative text-honey-500"
        style={{ width: size * 0.52, height: size * 0.52 }}
        fill="currentColor"
      >
        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
      </svg>
    </span>
  );
}

export function Logo({ size = "md", href = "/" }: { size?: LogoSize; href?: string }) {
  const s = sizes[size];
  const inner = (
    <span className={`inline-flex items-center ${s.gap} leading-none`}>
      <LogoMark size={s.box} />
      <span className="inline-flex items-baseline tracking-tight">
        <span className={`font-display font-extrabold text-graphite ${s.lf}`}>lf</span>
        <span className={`font-display font-extrabold text-honey-600 ${s.party}`}>party</span>
      </span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="no-underline transition-opacity hover:opacity-90">
      {inner}
    </Link>
  );
}
