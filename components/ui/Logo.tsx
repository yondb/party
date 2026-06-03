import Link from "next/link";
import { useId } from "react";

type LogoSize = "sm" | "md" | "lg";

const config: Record<
  LogoSize,
  { mark: number; text: string; gap: string; showWord: boolean }
> = {
  sm: { mark: 26, text: "text-[15px]", gap: "gap-2", showWord: true },
  md: { mark: 32, text: "text-lg", gap: "gap-2.5", showWord: true },
  lg: { mark: 44, text: "text-2xl", gap: "gap-3", showWord: true },
};

/** Honey badge — two soft circles = people meeting up */
function LogoMark({ size, gradId }: { size: number; gradId: string }) {
  return (<svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0 drop-shadow-[0_2px_6px_rgba(245,184,0,0.35)]"
    >
      <rect width="40" height="40" rx="11" fill={`url(#${gradId})`} />
      <circle cx="15.5" cy="20" r="7.25" fill="white" fillOpacity="0.95" />
      <circle cx="24.5" cy="20" r="7.25" fill="white" fillOpacity="0.72" />
      <circle cx="20" cy="13" r="2" fill="white" fillOpacity="0.9" />
      <defs>
        <linearGradient
          id={gradId}
          x1="6"
          y1="4"
          x2="34"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDE68A" />
          <stop offset="0.45" stopColor="#F5B800" />
          <stop offset="1" stopColor="#D4A017" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LogoWordmark({ className }: { className: string }) {
  return (<span
      className={`font-display font-extrabold tracking-[-0.045em] text-graphite ${className}`}
    >
      lf
      <span className="text-honey-600">party</span>
    </span>
  );
}

export function Logo({
  size = "md",
  href = "/map",
  showWordmark = true,
}: {
  size?: LogoSize;
  href?: string;
  /** Pass empty string to render without link wrapper */
  showWordmark?: boolean;
}) {
  const gradId = useId().replace(/:/g, "");
  const c = config[size];

  const inner = (<span className={`inline-flex items-center ${c.gap} leading-none`}>
      <LogoMark size={c.mark} gradId={gradId} />
      {showWordmark && c.showWord ? <LogoWordmark className={c.text} /> : null}
    </span>
  );

  if (href === "") return inner;

  return (<Link
      href={href}
      className="inline-flex no-underline transition-opacity hover:opacity-[0.88] active:opacity-80"
    >
      {inner}
    </Link>
  );
}
