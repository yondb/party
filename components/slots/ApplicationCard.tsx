"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { ReliabilityScore } from "@/components/ui/ReliabilityScore";
import { respondToApplication } from "@/app/actions/applications";
import { applicationCardUi } from "@/lib/i18n-ui";

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

export type ApplicationCardCopy = ReturnType<typeof applicationCardUi>;

type ApplicationCardProps = {
  row: ApplicantRow;
  index?: number;
  copy: ApplicationCardCopy;
  /** When true (host manage view), host can move people between pending / accepted / rejected. */
  hostControls?: boolean;
};

function actionBarClass() {
  return "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch";
}

function actionFormClass() {
  return "min-w-0 flex-1 sm:min-w-[8.5rem]";
}

export function ApplicationCard({ row, index = 0, copy, hostControls = false }: ApplicationCardProps) {
  const dim = row.status === "rejected";

  return (<motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`card flex flex-col gap-3 rounded-lg p-4 ${dim ? "opacity-60" : ""}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Avatar src={row.avatar_url} name={row.name} size={48} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-[var(--text-primary)]">{row.name}</span>
            <LevelBadge level={row.level} />
            <ReliabilityScore score={row.reliability_score} size={28} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {copy.exp} {row.exp}
          </p>
          {row.message ? (<p className="mt-2 break-words rounded border border-[var(--border-medium)] bg-[var(--bg-input)] p-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              {row.message}
            </p>
          ) : null}
        </div>
      </div>

      {row.status === "pending" ? (<div className={actionBarClass()}>
          <form
            className={actionFormClass()}
            action={async () => {
              await respondToApplication(row.applicationId, "accepted");
            }}
          >
            <Button type="submit" variant="primary" fullWidth>
              {copy.accept}
            </Button>
          </form>
          <form
            className={actionFormClass()}
            action={async () => {
              await respondToApplication(row.applicationId, "rejected");
            }}
          >
            <Button type="submit" variant="secondary" fullWidth>
              {copy.reject}
            </Button>
          </form>
        </div>
      ) : hostControls && row.status === "accepted" ? (<div className={actionBarClass()}>
          <form
            className={actionFormClass()}
            action={async () => {
              await respondToApplication(row.applicationId, "pending");
            }}
          >
            <Button type="submit" variant="secondary" fullWidth>
              {copy.toPending}
            </Button>
          </form>
          <form
            className={actionFormClass()}
            action={async () => {
              await respondToApplication(row.applicationId, "rejected");
            }}
          >
            <Button type="submit" variant="secondary" fullWidth>
              {copy.removeFromParty}
            </Button>
          </form>
        </div>
      ) : hostControls && row.status === "rejected" ? (<div className={actionBarClass()}>
          <form
            className={actionFormClass()}
            action={async () => {
              await respondToApplication(row.applicationId, "accepted");
            }}
          >
            <Button type="submit" variant="primary" fullWidth>
              {copy.acceptAgain}
            </Button>
          </form>
          <form
            className={actionFormClass()}
            action={async () => {
              await respondToApplication(row.applicationId, "pending");
            }}
          >
            <Button type="submit" variant="secondary" fullWidth>
              {copy.toPending}
            </Button>
          </form>
        </div>
      ) : (<p className="text-center text-sm font-medium text-[var(--text-muted)]">
          {row.status === "accepted" ? copy.inParty : copy.rejected}
        </p>
      )}
    </motion.div>
  );
}
