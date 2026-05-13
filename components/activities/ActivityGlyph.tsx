import type { ActivityKey } from "@/lib/activities";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type Props = {
  activityKey: ActivityKey;
  /** Pixel size (width & height). */
  size: number;
  className?: string;
};

/** Line-art icons — matches gold/dark WOW UI; no emoji. */
export function ActivityGlyph({ activityKey, size, className = "" }: Props) {
  const c = stroke;
  const inner = (() => {
    switch (activityKey) {
      case "running":
        return (
          <>
            <circle cx="9" cy="5" r="2" {...c} />
            <path d="M7 22v-6l-2-4h4l2 4v6M13 8l4 2 2 6M15 22v-4" {...c} />
          </>
        );
      case "coffee":
        return (
          <>
            <path d="M5 6h10v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6zM15 9h2a2 2 0 0 1 0 4h-2M7 19v2M11 19v2" {...c} />
          </>
        );
      case "volleyball":
        return (
          <>
            <circle cx="12" cy="12" r="7" {...c} />
            <path d="M5 12h14M12 5c2 2 3 4 3 7s-1 5-3 7M12 5c-2 2-3 4-3 7s1 5 3 7" {...c} />
          </>
        );
      case "cycling":
        return (
          <>
            <circle cx="7" cy="16" r="3" {...c} />
            <circle cx="17" cy="16" r="3" {...c} />
            <path d="M10 16l3-9 2 5h3M13 7h4" {...c} />
          </>
        );
      case "boardgames":
        return (
          <>
            <rect x="5" y="5" width="6" height="6" rx="1" {...c} />
            <rect x="13" y="5" width="6" height="6" rx="1" {...c} />
            <rect x="5" y="13" width="6" height="6" rx="1" {...c} />
            <rect x="13" y="13" width="6" height="6" rx="1" {...c} />
          </>
        );
      case "gym":
        return (
          <>
            <path d="M6 12h3l2-3 2 6 2-6 2 3h3M6 12v4M18 12v4" {...c} />
            <path d="M4 10v4M20 10v4" {...c} />
          </>
        );
      case "hiking":
        return (
          <>
            <path d="M4 18l5-6 3 2 4-8 4 12H4zM9 12l2 2" {...c} />
          </>
        );
      case "walking":
        return (
          <>
            <circle cx="10" cy="5" r="2" {...c} />
            <path d="M8 22v-7l-1-3h4l1 3v7M12 12l4 2 2 5" {...c} />
          </>
        );
      case "yoga":
        return (
          <>
            <path d="M12 4v3M9 9c2 0 3 1 3 3v3M15 9c-2 0-3 1-3 3v3M9 15h6M8 20h8M10 20v2M14 20v2" {...c} />
          </>
        );
      case "movies":
        return (
          <>
            <rect x="4" y="7" width="16" height="11" rx="1" {...c} />
            <path d="M4 10h16M9 7V5h6v2" {...c} />
          </>
        );
      case "food":
        return (
          <>
            <path d="M8 4v8a4 4 0 0 0 8 0V4M8 8h8M12 4v16" {...c} />
          </>
        );
      case "study":
        return (
          <>
            <path d="M6 5h12v14H6zM6 5l6 4 6-4M9 12h6M9 15h4" {...c} />
          </>
        );
      case "other":
        return (
          <>
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" {...c} />
            <circle cx="12" cy="12" r="3" {...c} />
          </>
        );
    }
  })();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      {inner}
    </svg>
  );
}
