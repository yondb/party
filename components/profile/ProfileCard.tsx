"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { ExpBar } from "@/components/ui/ExpBar";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { ReliabilityScore } from "@/components/ui/ReliabilityScore";
import { Divider } from "@/components/ui/Divider";
import { StatBlock } from "./StatBlock";
import { AchievementBadge } from "./AchievementBadge";
import { getActivity, type ActivityKey } from "@/lib/activities";
import { ICON_FEMALE, ICON_MALE, profileUi } from "@/lib/i18n-ui";
import { getLevelProgress, getTitleForExp, getNextLevelRow } from "@/lib/exp";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export type ProfileUser = {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  gender: "male" | "female";
  birth_date: string;
  reliability_score: number;
  exp: number;
  level: number;
  total_activities: number;
  total_hosted: number;
};

type ProfileCardProps = {
  user: ProfileUser;
  avgRating?: number | null;
  activityCounts?: Partial<Record<ActivityKey, number>>;
  occasionalStats?: {
    completionist: boolean;
    samePersonRuns: number;
    anniversaryQuest: boolean;
    socialButterfly: boolean;
    hostAndPlayerMaster: boolean;
  };
  isOwn?: boolean;
};

function barLevel(count: number) {
  return Math.min(20, Math.floor(count * 2) + 1);
}

/** Hide obvious placeholder / test bios in the UI. */
function displayBio(bio: string | null): string | null {
  if (!bio?.trim()) return null;
  const trimmed = bio.trim();
  if (/^(lol+|test\d*(\s+test\d*)*)+$/i.test(trimmed)) return null;
  if (/test\d+/i.test(trimmed) && trimmed.length > 40) return null;
  return trimmed;
}

export function ProfileCard({
  user,
  avgRating,
  activityCounts,
  occasionalStats,
}: ProfileCardProps) {
  const { lang } = useLanguage();
  const p = profileUi(lang);
  const title = getTitleForExp(user.exp);
  const progress = getLevelProgress(user.exp);
  const next = getNextLevelRow(user.exp);
  const rel = user.reliability_score ?? 1;
  const expLabel = next ? `${user.exp} / ${next.expRequired} XP` : `${user.exp} XP · ${p.maxLevel}`;
  const bio = displayBio(user.bio);
  const hasAtLeastTypes = (n: number) =>
    Object.values(activityCounts ?? {}).filter((count) => (count ?? 0) > 0).length >= n;

  const achievementGroups = [
    {
      category: "Łatwe",
      items: [
        { icon: "⚔️", title: "First Blood", description: "Dołącz do lfparty", show: true },
        { icon: "👣", title: "Pierwszy krok", description: "Ukończ 1 aktywność", show: user.total_activities >= 1 },
        { icon: "🛡️", title: "Pierwszy host", description: "Zhostuj 1 quest", show: user.total_hosted >= 1 },
        { icon: "🏃", title: "Runner", description: "Ukończ aktywność running", show: (activityCounts?.running ?? 0) > 0 },
        { icon: "☕", title: "Coffee Time", description: "Ukończ aktywność coffee", show: (activityCounts?.coffee ?? 0) > 0 },
      ],
    },
    {
      category: "Średnie",
      items: [
        { icon: "🗺️", title: "Explorer", description: "Spróbuj 3 różnych typów aktywności", show: hasAtLeastTypes(3) },
        { icon: "🎯", title: "Regular", description: "Ukończ 5 aktywności", show: user.total_activities >= 5 },
        { icon: "👑", title: "Party Leader", description: "Zhostuj 5 questów", show: user.total_hosted >= 5 },
        { icon: "💫", title: "Zaufany", description: "Miej reliability co najmniej 90%", show: rel >= 0.9 },
        { icon: "⭐", title: "Rated", description: "Średnia ocen co najmniej 4.5", show: (avgRating ?? 0) >= 4.5 },
      ],
    },
    {
      category: "Trudne",
      items: [
        { icon: "🔥", title: "Hardcore", description: "Ukończ 15 aktywności", show: user.total_activities >= 15 },
        { icon: "🏰", title: "Guild Master", description: "Zhostuj 12 questów", show: user.total_hosted >= 12 },
        { icon: "🧭", title: "Omni Explorer", description: "Spróbuj 6 różnych typów aktywności", show: hasAtLeastTypes(6) },
        { icon: "💎", title: "Elite", description: "Osiągnij poziom 10", show: user.level >= 10 },
        { icon: "🏆", title: "Legendarny", description: "Miej 25+ aktywności i średnią ocen 4.8+", show: user.total_activities >= 25 && (avgRating ?? 0) >= 4.8 },
      ],
    },
    {
      category: "Okazyjne",
      items: [
        {
          icon: "🎂",
          title: "Birthday Vibes",
          description: "Ukończ quest w dzień rocznicy konta",
          show: occasionalStats?.anniversaryQuest ?? false,
        },
        {
          icon: "🧩",
          title: "Completionist",
          description: "Ukończ wszystkie główne typy aktywności",
          show: occasionalStats?.completionist ?? false,
        },
        {
          icon: "🤝",
          title: "Loyal Duo",
          description: "Ukończ min. 5 aktywności z tą samą osobą",
          show: (occasionalStats?.samePersonRuns ?? 0) >= 5,
        },
        {
          icon: "🌐",
          title: "Social Butterfly",
          description: "Ukończ questy z min. 8 różnymi osobami",
          show: occasionalStats?.socialButterfly ?? false,
        },
        {
          icon: "⚔️",
          title: "Dual Class",
          description: "Miej min. 10 aktywności i 10 hostowanych questów",
          show: occasionalStats?.hostAndPlayerMaster ?? false,
        },
      ],
    },
  ];
  const visibleAchievements = achievementGroups.flatMap((group) =>
    group.items.filter((a) => a.show),
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-[600px]"
    >
      <div className="flex flex-col items-center gap-6 pt-2">
        <div className="relative">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt=""
              width={120}
              height={120}
              className="rounded-full border-4 object-cover"
              style={{ borderColor: "var(--border-medium)" }}
              unoptimized={user.avatar_url.includes("supabase.co")}
            />
          ) : (
            <Avatar src={null} name={user.name} size={120} />
          )}
          <div className="absolute -bottom-1 -right-1">
            <LevelBadge level={user.level} size="lg" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              {user.name}
            </h2>
            <span className="text-2xl leading-none" aria-hidden>
              {user.gender === "female" ? ICON_FEMALE : ICON_MALE}
            </span>
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              letterSpacing: "0.04em",
            }}
          >
            {title}
          </p>
        </div>

        <div className="w-full max-w-md">
          <ExpBar progress={progress} label={expLabel} comfortable />
        </div>

        <div className="flex flex-col items-center gap-2">
          <ReliabilityScore score={rel} size={64} />
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            {p.reliability}
          </p>
        </div>
      </div>

      <Divider className="!my-8" />

      <div className="grid grid-cols-3 gap-3">
        <StatBlock label={p.events} value={user.total_activities} />
        <StatBlock label={p.host} value={user.total_hosted} />
        <StatBlock label={p.rating} value={avgRating != null ? avgRating.toFixed(1) : p.noRatings} />
      </div>

      {activityCounts && Object.keys(activityCounts).length > 0 ? (
        <>
          <Divider className="!my-8" />
          <h3
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            {p.activityClasses}
          </h3>
          <ul className="mt-4 space-y-3">
            {(Object.keys(activityCounts) as ActivityKey[]).map((key) => {
              const c = activityCounts[key] ?? 0;
              if (!c) return null;
              const act = getActivity(key);
              const lv = barLevel(c);
              const pct = Math.min(1, lv / 20);
              return (
                <li key={key} className="flex items-center gap-3 text-sm">
                  <span className="w-8 shrink-0 text-center text-lg">{act.icon}</span>
                  <span className="min-w-0 flex-1 text-[var(--text-secondary)]">{act.label}</span>
                  <div
                    className="h-2 w-24 shrink-0 overflow-hidden rounded-full"
                    style={{ background: "var(--bg-surface-2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct * 100}%`, background: act.color }}
                    />
                  </div>
                  <span
                    className="shrink-0 text-xs font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    Lv.{lv}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <Divider className="!my-8" />
      <h3
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {p.badges}
      </h3>
      <div className="mt-4 flex flex-wrap gap-3">
        {visibleAchievements.length ? (
          visibleAchievements.map((a) => <AchievementBadge key={a.title} {...a} />)
        ) : (
          <span className="text-sm text-[var(--text-muted)]">{p.noBadges}</span>
        )}
      </div>

      {bio ? (
        <>
          <Divider className="!my-8" />
          <p className="text-center text-base leading-relaxed text-[var(--text-secondary)]">{bio}</p>
        </>
      ) : null}
    </motion.article>
  );
}
