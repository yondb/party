import { sendTransactionalEmail } from "@/lib/email";
import { buildSlotShareUrl } from "@/lib/growth/share-url";
import { wasGrowthEventRecent } from "@/lib/growth/dedupe";
import { trackGrowthEvent } from "@/lib/growth/track";
import { MARKET_CITY } from "@/lib/market";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SITE_NAME } from "@/lib/site";

const IDLE_DAYS = 7;

export async function runReengageCron(): Promise<{ ok: true; emailsSent: number }> {
  const admin = createServiceRoleClient();
  const now = new Date();
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const idleBefore = new Date(now.getTime() - IDLE_DAYS * 24 * 60 * 60 * 1000);

  const { data: placeRows } = await admin.from("places").select("id").eq("city", MARKET_CITY);
  const placeIds = (placeRows ?? []).map((p) => p.id);
  if (placeIds.length === 0) return { ok: true, emailsSent: 0 };

  const { data: slots } = await admin
    .from("slots")
    .select("id, title, activity_type, date_time, location_name")
    .eq("status", "open")
    .in("place_id", placeIds)
    .gte("date_time", now.toISOString())
    .lte("date_time", week.toISOString())
    .order("date_time", { ascending: true })
    .limit(5);

  const top = slots ?? [];
  if (top.length === 0) return { ok: true, emailsSent: 0 };

  const inviteUrl = buildSlotShareUrl(top[0].id, "email_digest");
  let emailsSent = 0;
  let page = 1;

  while (page <= 20) {
    const { data: listData, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error || !listData?.users?.length) break;

    for (const u of listData.users) {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      if (meta.marketing_opt_in !== true || !u.email) continue;

      const last = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;
      if (!last || last > idleBefore) continue;

      const dup = await wasGrowthEventRecent("reengage_sent", {
        userId: u.id,
        withinHours: 168,
      });
      if (dup) continue;

      const sent = await sendTransactionalEmail({
        to: u.email,
        subject: `${top.length} meetups near you on ${SITE_NAME}`,
        html: `<p>We miss you on ${SITE_NAME}. Open meetups this week in Austin — e.g. <strong>${top[0].title}</strong>.</p><p><a href="${inviteUrl}">Browse invites</a></p>`,
      });
      if (sent.ok) {
        emailsSent += 1;
        await trackGrowthEvent({
          event_name: "reengage_sent",
          user_id: u.id,
          properties: { slot_ids: top.map((s) => s.id) },
        });
      }
    }

    if (listData.users.length < 100) break;
    page += 1;
  }

  return { ok: true, emailsSent };
}
