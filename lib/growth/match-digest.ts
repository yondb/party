import { sendTransactionalEmail } from "@/lib/email";
import { wasGrowthEventRecent } from "@/lib/growth/dedupe";
import { buildSlotShareUrl } from "@/lib/growth/share-url";
import { trackGrowthEvent } from "@/lib/growth/track";
import { activityLabel } from "@/lib/i18n-ui";
import { MARKET_CITY } from "@/lib/market";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SITE_NAME } from "@/lib/site";

type OpenSlot = {
  id: string;
  title: string;
  activity_type: string;
  date_time: string;
  location_name: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slotLine(slot: OpenSlot): string {
  const when = new Date(slot.date_time).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const url = buildSlotShareUrl(slot.id, "email_digest");
  return `<li style="margin:0 0 12px"><strong>${escapeHtml(slot.title)}</strong><br/>
    ${escapeHtml(activityLabel(slot.activity_type))} · ${escapeHtml(when)} · ${escapeHtml(slot.location_name)}<br/>
    <a href="${url}">View invite</a></li>`;
}

export async function runMatchDigestCron(): Promise<{
  ok: true;
  emailsSent: number;
  slotsConsidered: number;
}> {
  const admin = createServiceRoleClient();
  const now = new Date();
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: placeRows } = await admin
    .from("places")
    .select("id")
    .eq("city", MARKET_CITY);
  const placeIds = (placeRows ?? []).map((p) => p.id);
  if (placeIds.length === 0) {
    return { ok: true, emailsSent: 0, slotsConsidered: 0 };
  }

  const { data: slots } = await admin
    .from("slots")
    .select("id, title, activity_type, date_time, location_name, place_id, spots_taken, max_spots")
    .eq("status", "open")
    .in("place_id", placeIds)
    .gte("date_time", now.toISOString())
    .lte("date_time", week.toISOString())
    .order("date_time", { ascending: true })
    .limit(20);

  const openSlots: OpenSlot[] = (slots ?? []).filter((s) => {
    const cap = Math.max(1, s.max_spots - 1);
    return s.spots_taken < cap;
  });

  if (openSlots.length === 0) {
    return { ok: true, emailsSent: 0, slotsConsidered: 0 };
  }

  let emailsSent = 0;
  let page = 1;
  const perPage = 100;

  while (page <= 20) {
    const { data: listData, error: listErr } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (listErr || !listData?.users?.length) break;

    for (const u of listData.users) {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      if (meta.marketing_opt_in !== true) continue;
      if (!u.email) continue;

      const prefs = (meta.preferred_activities as string[] | undefined) ?? [];
      const matched =
        prefs.length === 0
          ? openSlots.slice(0, 3)
          : openSlots.filter((s) => prefs.includes(s.activity_type)).slice(0, 3);
      if (matched.length === 0) continue;

      const dup = await wasGrowthEventRecent("match_digest_sent", {
        userId: u.id,
        withinHours: 20,
      });
      if (dup) continue;

      const html = `<p>Hi — here are meetups near you this week on ${SITE_NAME}:</p><ul>${matched.map(slotLine).join("")}</ul><p><a href="${buildSlotShareUrl(matched[0].id, "email_digest")}">Open lfparty</a></p>`;

      const sent = await sendTransactionalEmail({
        to: u.email,
        subject: `${matched.length} meetup${matched.length === 1 ? "" : "s"} near you this week`,
        html,
      });
      if (sent.ok) {
        emailsSent += 1;
        await trackGrowthEvent({
          event_name: "match_digest_sent",
          user_id: u.id,
          properties: { slot_ids: matched.map((s) => s.id) },
        });
      }
    }

    if (listData.users.length < perPage) break;
    page += 1;
  }

  return { ok: true, emailsSent, slotsConsidered: openSlots.length };
}

export async function runHostShareNudgeCron(): Promise<{ ok: true; nudgesSent: number }> {
  const admin = createServiceRoleClient();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: slots } = await admin
    .from("slots")
    .select("id, title, host_id, created_at")
    .eq("status", "open")
    .lte("created_at", twoHoursAgo)
    .order("created_at", { ascending: false })
    .limit(30);

  let nudgesSent = 0;

  for (const slot of slots ?? []) {
    const { count } = await admin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("slot_id", slot.id);
    if ((count ?? 0) > 0) continue;

    const dup = await wasGrowthEventRecent("host_share_nudge_sent", {
      slotId: slot.id,
      withinHours: 48,
    });
    if (dup) continue;

    const { data: authBundle } = await admin.auth.admin.getUserById(slot.host_id);
    const email = authBundle?.user?.email;
    if (!email) continue;
    const meta = authBundle?.user?.user_metadata as Record<string, unknown> | undefined;
    if (meta?.notify_email_transactional === false) continue;

    const inviteUrl = buildSlotShareUrl(slot.id, "share");
    const sent = await sendTransactionalEmail({
      to: email,
      subject: `Share your meetup: ${slot.title}`,
      html: `<p>Your quest <strong>${escapeHtml(slot.title)}</strong> has no applications yet.</p>
        <p>Open the app → <strong>Share</strong> to copy an invite link:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>`,
    });
    if (sent.ok) {
      nudgesSent += 1;
      await trackGrowthEvent({
        event_name: "host_share_nudge_sent",
        user_id: slot.host_id,
        slot_id: slot.id,
      });
    }
  }

  return { ok: true, nudgesSent };
}
