import { NextResponse } from "next/server";
import { runEnsureSupplyCron } from "@/lib/growth/ensure-supply";
import { runHostShareNudgeCron, runMatchDigestCron } from "@/lib/growth/match-digest";
import { runReengageCron } from "@/lib/growth/reengage";
import { runSocialQueueCron } from "@/lib/growth/social-queue";
import { runSlotLifecycle } from "@/lib/slot-lifecycle";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const job = url.searchParams.get("job") ?? "all";
  const started = Date.now();

  try {
    const admin = createServiceRoleClient();
    let lifecycle = false;
    if (job === "all" || job === "lifecycle") {
      await runSlotLifecycle(admin);
      lifecycle = true;
    }

    const result: Record<string, unknown> = {
      ok: true,
      job,
      lifecycle,
      ms: 0,
    };

    if (job === "all" || job === "digest") {
      result.digest = await runMatchDigestCron();
    }
    if (job === "all" || job === "nudge") {
      result.nudges = await runHostShareNudgeCron();
    }
    if (job === "all" || job === "supply") {
      result.supply = await runEnsureSupplyCron();
    }
    if (job === "all" || job === "reengage") {
      result.reengage = await runReengageCron();
    }
    if (job === "all" || job === "social") {
      result.social = await runSocialQueueCron();
    }

    result.ms = Date.now() - started;
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message, job, ms: Date.now() - started }, { status: 500 });
  }
}
