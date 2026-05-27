import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";

const textSizes: Record<LogoSize, { lf: string; party: string }> = {
  sm: { lf: "text-lg", party: "text-lg" },
  md: { lf: "text-xl", party: "text-xl" },
  lg: { lf: "text-2xl", party: "text-2xl" },
};

export function Logo({ size = "md", href = "/" }: { size?: LogoSize; href?: string }) {
  const t = textSizes[size];
  const inner = (
    <span className="inline-flex items-baseline gap-0.5 leading-none">
      <span className={`font-display font-extrabold text-graphite ${t.lf}`}>lf</span>
      <span className={`font-sans font-medium text-ash-500 ${t.party}`}>party</span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="no-underline">
      {inner}
    </Link>
  );
}
