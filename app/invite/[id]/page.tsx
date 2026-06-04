import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getActivity } from "@/lib/activities";
import { activityLabel } from "@/lib/i18n-ui";
import { ActivityIcon } from "@/components/slots/ActivityIcon";
import { InviteAttribution } from "@/components/invite/InviteAttribution";
import { InviteJoinLink } from "@/components/invite/InviteJoinLink";
import { Logo } from "@/components/ui/Logo";
import { MARKET_CITY_LABEL } from "@/lib/market";
import { getSiteUrl } from "@/lib/site";
import { buildSlotShareUrl } from "@/lib/growth/share-url";

export const dynamic = "force-dynamic";

async function loadInviteSlot(id: string) {
  const supabase = await createClient();
  const { data: slot } = await supabase
    .from("slots")
    .select(
      "id, title, description, activity_type, date_time, location_name, max_spots, spots_taken, status, host_id, place_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!slot || slot.status === "cancelled" || slot.status === "completed") {
    return null;
  }

  let hostName: string | null = null;
  try {
    const admin = createServiceRoleClient();
    const { data: host } = await admin
      .from("users")
      .select("name")
      .eq("id", slot.host_id)
      .maybeSingle();
    hostName = host?.name ?? null;
  } catch {
    hostName = null;
  }

  return { slot, hostName };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const loaded = await loadInviteSlot(id);
  if (!loaded) return { title: "Invite · lfparty" };

  const { slot } = loaded;
  const activity = activityLabel(slot.activity_type);
  const when = new Date(slot.date_time).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const description = `${activity} · ${when} · ${slot.location_name} · ${MARKET_CITY_LABEL}`;
  const base = getSiteUrl();
  const path = `/invite/${id}`;

  return {
    title: `${slot.title} · lfparty`,
    description,
    openGraph: {
      title: slot.title,
      description,
      url: new URL(path, base).toString(),
      type: "website",
      images: [{ url: new URL(`/invite/${id}/opengraph-image`, base).toString(), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: slot.title,
      description,
      images: [new URL(`/invite/${id}/opengraph-image`, base).toString()],
    },
  };
}

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.user_metadata?.setup_done === true) {
    redirect(`/slots/${id}`);
  }

  const loaded = await loadInviteSlot(id);
  if (!loaded) notFound();

  const { slot, hostName } = loaded;
  const act = getActivity(slot.activity_type);
  const guestCap = Math.max(1, slot.max_spots - 1);
  const spotsLeft = Math.max(0, guestCap - slot.spots_taken);
  const when = new Date(slot.date_time).toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const authHref = `/auth?next=${encodeURIComponent(`/slots/${id}`)}`;

  return (
    <div className="min-h-dvh bg-[var(--bg-page)]">
      <InviteAttribution slotId={id} />
      <header className="border-b border-ash-200/70 bg-surface/95 px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Logo size="sm" href="/landing" />
          <Link href={authHref} className="text-sm font-medium text-honey-700 hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        <div
          className="overflow-hidden rounded-3xl border border-ash-200/70 bg-surface shadow-lg"
          style={{ borderTop: `4px solid ${act.color}` }}
        >
          <div
            className="flex items-start gap-4 p-5"
            style={{ background: `color-mix(in srgb, ${act.color} 10%, white)` }}
          >
            <ActivityIcon activityType={slot.activity_type} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-caption font-medium uppercase tracking-wide text-ash-500">
                {MARKET_CITY_LABEL}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-ash-900">{slot.title}</h1>
              <p className="mt-2 text-body-sm text-ash-600">{when}</p>
              <p className="mt-1 text-body-sm text-ash-600">📍 {slot.location_name}</p>
            </div>
          </div>

          <div className="space-y-4 p-5">
            {hostName ? (
              <p className="text-body-sm text-ash-600">
                Hosted by <span className="font-semibold text-ash-900">{hostName}</span>
              </p>
            ) : null}
            {slot.description ? (
              <p className="text-body-sm leading-relaxed text-ash-700">{slot.description}</p>
            ) : null}
            <p className="rounded-2xl bg-honey-50 px-4 py-3 text-center text-body-sm font-semibold text-honey-900">
              {spotsLeft > 0
                ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left — join on lfparty`
                : "This meetup is full — browse more on the map"}
            </p>
            <InviteJoinLink
              href={authHref}
              slotId={id}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-graphite text-body-sm font-semibold text-surface transition hover:opacity-90"
            >
              Join on lfparty
            </InviteJoinLink>
            <p className="text-center text-caption text-ash-400">
              Free to join · {activityLabel(slot.activity_type)}
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-caption text-ash-400">
          Share link:{" "}
          <span className="break-all font-mono text-ash-500">{buildSlotShareUrl(id)}</span>
        </p>
      </main>
    </div>
  );
}
