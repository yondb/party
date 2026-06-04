import { MARKET_CITY } from "@/lib/market";
import { trackGrowthEvent } from "@/lib/growth/track";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const MIN_OPEN_DOG_WALK = 3;
const ROTATING_TITLES = [
  {
    title: "Weekend dog walk — join the crew",
    description: "Community starter slot in Austin. Share the invite link to fill spots.",
    hint: "zilker",
    lat: 30.2669,
    lng: -97.7729,
    daysFromNow: 3,
    hour: 10,
  },
  {
    title: "Lake trail dog walk — all welcome",
    description: "Easy pace, leashed dogs. First to apply gets in.",
    hint: "mueller",
    lat: 30.298,
    lng: -97.705,
    daysFromNow: 4,
    hour: 9,
  },
  {
    title: "Park meetup — dogs & humans",
    description: "Auto-created so the map stays alive. Host or join on lfparty.",
    hint: "auditorium",
    lat: 30.2633,
    lng: -97.7633,
    daysFromNow: 5,
    hour: 17,
  },
] as const;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function resolveMarketingHostId(): Promise<string | null> {
  const admin = createServiceRoleClient();
  const uid = process.env.MARKETING_HOST_USER_ID?.trim();
  if (uid) return uid;

  const email = process.env.MARKETING_HOST_EMAIL?.trim()?.toLowerCase();
  if (!email) return null;

  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

export async function runEnsureSupplyCron(): Promise<{
  ok: true;
  openCount: number;
  created: number;
}> {
  const admin = createServiceRoleClient();
  const hostId = await resolveMarketingHostId();
  if (!hostId) {
    return { ok: true, openCount: 0, created: 0 };
  }

  const now = new Date();
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: places } = await admin
    .from("places")
    .select("id, name, lat, lng")
    .eq("city", MARKET_CITY)
    .eq("category", "dog_walk")
    .eq("is_free", true);

  const placeRows = places ?? [];
  if (placeRows.length === 0) {
    return { ok: true, openCount: 0, created: 0 };
  }

  const placeIds = placeRows.map((p) => p.id);
  const { data: openSlots } = await admin
    .from("slots")
    .select("id")
    .eq("activity_type", "dog_walk")
    .eq("status", "open")
    .in("place_id", placeIds)
    .gte("date_time", now.toISOString())
    .lte("date_time", week.toISOString());

  const openCount = openSlots?.length ?? 0;
  if (openCount >= MIN_OPEN_DOG_WALK) {
    return { ok: true, openCount, created: 0 };
  }

  let created = 0;
  const need = MIN_OPEN_DOG_WALK - openCount;

  for (let i = 0; i < need && i < ROTATING_TITLES.length; i++) {
    const t = ROTATING_TITLES[i];
    const suffix = new Date().toISOString().slice(0, 10);
    const title = `${t.title} (${suffix})`;

    const { data: existing } = await admin
      .from("slots")
      .select("id")
      .eq("host_id", hostId)
      .eq("title", title)
      .maybeSingle();
    if (existing) continue;

    const h = t.hint.toLowerCase();
    const pool = placeRows.filter((p) => p.name.toLowerCase().includes(h));
    const pick = (pool.length > 0 ? pool : placeRows)
      .map((p) => ({ p, km: distanceKm(t.lat, t.lng, p.lat, p.lng) }))
      .sort((a, b) => a.km - b.km)[0]?.p;
    if (!pick) continue;

    const d = new Date();
    d.setUTCDate(d.getUTCDate() + t.daysFromNow);
    d.setUTCHours(t.hour + 5, 0, 0, 0);

    const { data: inserted, error } = await admin
      .from("slots")
      .insert({
        host_id: hostId,
        place_id: pick.id,
        activity_type: "dog_walk",
        title,
        description: t.description,
        date_time: d.toISOString(),
        location_name: pick.name,
        location_lat: pick.lat,
        location_lng: pick.lng,
        max_spots: 6,
        min_reliability: 0,
        min_level: 0,
        gender_scope: "any",
        status: "open",
      })
      .select("id")
      .single();

    if (!error && inserted) {
      created += 1;
      await trackGrowthEvent({
        event_name: "supply_slot_created",
        slot_id: inserted.id,
        user_id: hostId,
        properties: { auto: true },
      });
    }
  }

  return { ok: true, openCount, created };
}
