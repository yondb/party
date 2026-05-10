"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { ReliabilityScore } from "@/components/ui/ReliabilityScore";
import { respondToApplication } from "@/app/actions/applications";

export type ApplicantRow = {
  applicationId: string;
  userId: string;
  name: string;
  avatar_url: string | null;
  level: number;
  reliability_score: number;
  exp: number;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
};

type ApplicationCardProps = {
  row: ApplicantRow;
  index?: number;
};

export function ApplicationCard({ row, index = 0 }: ApplicationCardProps) {
  const dim = row.status === "rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`wow-card flex flex-col gap-3 rounded-lg p-4 ${dim ? "opacity-50" : ""}`}
    >
      <div className="flex gap-3">
        <Avatar src={row.avatar_url} name={row.name} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg text-[var(--text-bright)]">{row.name}</span>
            <LevelBadge level={row.level} />
            <ReliabilityScore score={row.reliability_score} size={28} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">EXP {row.exp}</p>
          {row.message ? (
            <p className="mt-2 rounded border border-[var(--gold-dim)] bg-[var(--bg-input)] p-2 text-sm text-[var(--text-secondary)]">
              {row.message}
            </p>
          ) : null}
        </div>
      </div>
      {row.status === "pending" ? (
        <div className="flex gap-2">
          <form
            className="flex-1"
            action={async () => {
              await respondToApplication(row.applicationId, "accepted");
            }}
          >
            <Button type="submit" variant="primary" fullWidth>
              Akceptuj
            </Button>
          </form>
          <form
            className="flex-1"
            action={async () => {
              await respondToApplication(row.applicationId, "rejected");
            }}
          >
            <Button type="submit" variant="secondary" fullWidth>
              Odrzuć
            </Button>
          </form>
        </div>
      ) : (
        <p className="font-display text-center text-sm uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {row.status === "accepted" ? "W party" : "Odrzucony"}
        </p>
      )}
    </motion.div>
  );
}
