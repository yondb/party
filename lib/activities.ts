export type ActivityKey =
  | "running"
  | "coffee"
  | "volleyball"
  | "cycling"
  | "boardgames"
  | "gym"
  | "hiking"
  | "walking"
  | "yoga"
  | "movies"
  | "food"
  | "study"
  | "other";

export type ActivityDef = {
  label: string;
  icon: string;
  color: string;
  gradient: string;
  cssVar: string;
};

export const ACTIVITIES: Record<ActivityKey, ActivityDef> = {
  running: {
    label: "Running",
    icon: "🏃",
    color: "#c07030",
    gradient: "linear-gradient(135deg, #c07030, #8a4a10)",
    cssVar: "var(--class-running)",
  },
  coffee: {
    label: "Coffee",
    icon: "☕",
    color: "#8a5a30",
    gradient: "linear-gradient(135deg, #8a5a30, #5a3a1a)",
    cssVar: "var(--class-coffee)",
  },
  volleyball: {
    label: "Volleyball",
    icon: "🏐",
    color: "#3a7a9a",
    gradient: "linear-gradient(135deg, #3a7a9a, #1a4a6a)",
    cssVar: "var(--class-volleyball)",
  },
  cycling: {
    label: "Cycling",
    icon: "🚴",
    color: "#4a8a4a",
    gradient: "linear-gradient(135deg, #4a8a4a, #2a5a2a)",
    cssVar: "var(--class-cycling)",
  },
  boardgames: {
    label: "Board games",
    icon: "♟️",
    color: "#7a3a8a",
    gradient: "linear-gradient(135deg, #7a3a8a, #4a1a5a)",
    cssVar: "var(--class-boardgames)",
  },
  gym: {
    label: "Gym",
    icon: "💪",
    color: "#9a3a3a",
    gradient: "linear-gradient(135deg, #9a3a3a, #6a1a1a)",
    cssVar: "var(--class-gym)",
  },
  hiking: {
    label: "Hiking",
    icon: "⛰️",
    color: "#6a7a3a",
    gradient: "linear-gradient(135deg, #6a7a3a, #4a5a1a)",
    cssVar: "var(--class-default)",
  },
  walking: {
    label: "Walking",
    icon: "🚶",
    color: "#7a8a4a",
    gradient: "linear-gradient(135deg, #7a8a4a, #55632f)",
    cssVar: "var(--class-default)",
  },
  yoga: {
    label: "Yoga",
    icon: "🧘",
    color: "#8a5a9a",
    gradient: "linear-gradient(135deg, #8a5a9a, #5a3a6a)",
    cssVar: "var(--class-boardgames)",
  },
  movies: {
    label: "Movies",
    icon: "🎬",
    color: "#5a6a8a",
    gradient: "linear-gradient(135deg, #5a6a8a, #33405a)",
    cssVar: "var(--class-volleyball)",
  },
  food: {
    label: "Food",
    icon: "🍜",
    color: "#9a6a3a",
    gradient: "linear-gradient(135deg, #9a6a3a, #6a4522)",
    cssVar: "var(--class-coffee)",
  },
  study: {
    label: "Study",
    icon: "📚",
    color: "#4a6f8a",
    gradient: "linear-gradient(135deg, #4a6f8a, #2f4a5f)",
    cssVar: "var(--class-volleyball)",
  },
  other: {
    label: "Other",
    icon: "✨",
    color: "#7a6a3a",
    gradient: "linear-gradient(135deg, #7a6a3a, #4f431f)",
    cssVar: "var(--class-default)",
  },
};

export const ACTIVITY_KEYS = Object.keys(ACTIVITIES) as ActivityKey[];

export function getActivity(key: string): ActivityDef {
  const k = key as ActivityKey;
  return ACTIVITIES[k] ?? {
    label: key,
    icon: "⚔️",
    color: "#6a6a3a",
    gradient: "linear-gradient(135deg, #6a6a3a, #3a3a1a)",
    cssVar: "var(--class-default)",
  };
}
