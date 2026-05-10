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
import { ICON_FEMALE, ICON_MALE } from "@/lib/i18n-ui";
import { getLevelProgress, getTitleForExp, getExpToNextLevel, getNextLevelRow } from "@/lib/exp";

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
  /** avg rating received — optional */
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

export function ProfileCard({
  user,
  avgRating,
  activityCounts,
  occasionalStats,
  isOwn,
}: ProfileCardProps) {
  const title = getTitleForExp(user.exp);
  const progress = getLevelProgress(user.exp);
  const next = getNextLevelRow(user.exp);
  const expToNext = getExpToNextLevel(user.exp);
  const rel = user.reliability_score ?? 1;
  const hasAtLeastTypes = (n: number) =>
    Object.values(activityCounts ?? {}).filter((count) => (count ?? 0) > 0).length >= n;

  const achievementGroups = [
    {
      category: "Łatwe",
      items: [
        { icon: "⚔️", title: "First Blood", description: "Dołącz do PartyFinder", show: true },
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
      className="wow-card relative overflow-hidden rounded-lg px-6 py-8 text-base text-[var(--text-secondary)] sm:px-8"
    >
      <div className="relative flex flex-col items-center gap-8 pt-1">
        <div className="relative">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt=""
              width={120}
              height={120}
              className="rounded-full border-4 border-[var(--gold-dark)] object-cover"
              unoptimized={user.avatar_url.includes("supabase.co")}
            />
          ) : (
            <Avatar src={null} name={user.name} size={120} />
          )}
          <div className="absolute -right-1 -top-1">
            <LevelBadge level={user.level} size="lg" />
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <h2 className="text-center font-display text-3xl font-bold leading-tight text-[var(--text-bright)] sm:text-4xl">
              {user.name}
            </h2>
            <span
              className="inline-flex h-12 min-w-[3rem] items-center justify-center rounded-lg border-2 border-[var(--gold-mid)] bg-[var(--bg-input)] px-2 font-mono text-3xl leading-none text-[var(--gold-bright)] shadow-[0_0_14px_rgba(240,192,64,0.18)] sm:h-14 sm:min-w-[3.25rem] sm:text-4xl"
              aria-label={user.gender === "female" ? "Female" : "Male"}
              title={user.gender === "female" ? "Female" : "Male"}
            >
              {user.gender === "female" ? ICON_FEMALE : ICON_MALE}
            </span>
          </div>
          <p className="text-center font-display text-lg font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] sm:text-xl sm:tracking-[0.16em]">
            {title}
          </p>
        </div>

        <div className="w-full max-w-md px-1">
          <ExpBar
            progress={progress}
            label={next ? `${user.exp} → +${expToNext} do Lvl ${next.level}` : "Max level"}
            comfortable
          />
        </div>

        <div className="flex items-center gap-5">
          <ReliabilityScore score={rel} size={52} />
          <div>
            <p className="font-display text-base uppercase tracking-[0.14em] text-[var(--text-secondary)] sm:text-lg">
              Reliability
            </p>
            <p className="font-display text-2xl text-[var(--status-open)]">
              {Math.round(rel * 100)}%
            </p>
          </div>
        </div>
      </div>

      <Divider className="!my-8" />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatBlock label="Aktyw." value={user.total_activities} />
        <StatBlock label="Host" value={user.total_hosted} />
        <StatBlock label="Ocena" value={avgRating != null ? avgRating.toFixed(1) : "—"} />
      </div>

      {activityCounts && Object.keys(activityCounts).length > 0 ? (
        <>
          <Divider className="!my-10" />
          <h3 className="font-display text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Klasy aktywności
          </h3>
          <ul className="mt-5 space-y-3">
            {(Object.keys(activityCounts) as ActivityKey[]).map((key) => {
              const c = activityCounts[key] ?? 0;
              if (!c) return null;
              const act = getActivity(key);
              const lv = barLevel(c);
              const p = Math.min(1, lv / 20);
              return (
                <li key={key} className="flex items-center gap-3 text-base">
                  <span className="w-9 shrink-0 text-center text-lg">{act.icon}</span>
                  <span className="min-w-0 flex-1 text-[var(--text-secondary)]">{act.label}</span>
                  <div className="h-2 w-28 shrink-0 overflow-hidden rounded border border-[var(--gold-dim)] bg-[var(--exp-bar-bg)]">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${p * 100}%`,
                        background: act.gradient,
                      }}
                    />
                  </div>
                  <span className="shrink-0 font-display text-sm text-[var(--gold-bright)]">Lv.{lv}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <Divider className="!my-10" />
      <h3 className="font-display text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">Odznaki</h3>
      <div className="mt-5 flex flex-wrap gap-3">
        {visibleAchievements.length ? (
          visibleAchievements.map((a) => <AchievementBadge key={a.title} {...a} />)
        ) : (
          <span className="text-sm text-[var(--text-muted)]">No badges unlocked yet.</span>
        )}
      </div>

      {user.bio ? (
        <>
          <Divider className="!my-10" />
          <p className="mt-3 text-center text-lg leading-relaxed text-[var(--text-secondary)]">{user.bio}</p>
        </>
      ) : null}

      {isOwn ? null : null}
    </motion.article>
  );
}
