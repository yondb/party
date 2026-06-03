/**
 * Seed launch dog_walk slots at iconic Austin spots (marketing week 1).
 * Requires: places imported (npm run import:places), host account exists.
 *
 * Set in .env.local:
 *   MARKETING_HOST_EMAIL=you@example.com   OR   MARKETING_HOST_USER_ID=<uuid>
 *
 * Run: npm run seed:marketing-slots
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MARKET_CITY } from "../lib/market.ts";
import { loadEnvLocal } from "./load-env.ts";

loadEnvLocal();

if (process.env.IMPORT_PLACES_INSECURE_TLS === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

type PlaceRow = { id: string; name: string; lat: number; lng: number };

const TEMPLATES = [
  {
    title: "Sunday Zilker loop — friendly dogs welcome",
    description: "Easy loop around Zilker. Friendly dogs welcome — share the link and fill your party.",
    hint: "zilker",
    lat: 30.2669,
    lng: -97.7729,
    daysFromNow: 2,
    hour: 10,
  },
  {
    title: "Auditorium Shores morning dog walk",
    description: "Meet at the lake trail. Leashed dogs, chill pace.",
    hint: "auditorium",
    lat: 30.2633,
    lng: -97.7633,
    daysFromNow: 3,
    hour: 8,
  },
  {
    title: "Red Bud Isle off-leash social",
    description: "Classic Austin dog spot. Bring water for you and your pup.",
    hint: "red bud",
    lat: 30.2947,
    lng: -97.7847,
    daysFromNow: 4,
    hour: 9,
  },
  {
    title: "Mueller Lake Park dog walk",
    description: "Flat loop around the lake — good for all sizes.",
    hint: "mueller",
    lat: 30.298,
    lng: -97.705,
    daysFromNow: 5,
    hour: 18,
  },
  {
    title: "Shoal Creek trail — dogs & coffee after",
    description: "Urban trail walk. Optional coffee nearby after.",
    hint: "shoal",
    lat: 30.285,
    lng: -97.745,
    daysFromNow: 6,
    hour: 17,
  },
  {
    title: "Saturday Zilker pack walk",
    description: "Weekend crew for a longer Zilker loop.",
    hint: "zilker",
    lat: 30.2669,
    lng: -97.7729,
    daysFromNow: 7,
    hour: 9,
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

async function resolveHostId(admin: SupabaseClient): Promise<string> {
  const uid = process.env.MARKETING_HOST_USER_ID?.trim();
  if (uid) return uid;

  const email = process.env.MARKETING_HOST_EMAIL?.trim()?.toLowerCase();
  if (!email) {
    console.error("Set MARKETING_HOST_EMAIL or MARKETING_HOST_USER_ID in .env.local");
    process.exit(1);
  }

  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) break;
    page += 1;
  }
  console.error(`No auth user found for ${email}. Sign up first, then re-run.`);
  process.exit(1);
}

async function loadDogWalkPlaces(admin: SupabaseClient): Promise<PlaceRow[]> {
  const { data, error } = await admin
    .from("places")
    .select("id, name, lat, lng")
    .eq("city", MARKET_CITY)
    .eq("category", "dog_walk")
    .eq("is_free", true);
  if (error) throw error;
  return data ?? [];
}

function pickPlace(places: PlaceRow[], hint: string, lat: number, lng: number): PlaceRow | null {
  if (places.length === 0) return null;
  const h = hint.toLowerCase();
  const byName = places.filter((p) => p.name.toLowerCase().includes(h));
  const pool = byName.length > 0 ? byName : places;
  return pool
    .map((p) => ({ p, km: distanceKm(lat, lng, p.lat, p.lng) }))
    .sort((a, b) => a.km - b.km)[0]?.p ?? null;
}

function slotDateTime(daysFromNow: number, hour: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(hour + 5, 0, 0, 0); // rough CDT offset for Austin marketing copy
  return d.toISOString();
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const admin = createClient(url, key);
  const hostId = await resolveHostId(admin);
  const places = await loadDogWalkPlaces(admin);

  if (places.length === 0) {
    console.error(`No dog_walk places in ${MARKET_CITY}. Run: npm run import:places`);
    process.exit(1);
  }

  console.log(`Host: ${hostId}`);
  console.log(`dog_walk places in DB: ${places.length}`);

  let created = 0;
  let skipped = 0;

  for (const t of TEMPLATES) {
    const { data: existing } = await admin
      .from("slots")
      .select("id")
      .eq("host_id", hostId)
      .eq("title", t.title)
      .maybeSingle();
    if (existing) {
      console.log(`  skip (exists): ${t.title}`);
      skipped += 1;
      continue;
    }

    const place = pickPlace(places, t.hint, t.lat, t.lng);
    if (!place) {
      console.warn(`  skip (no place): ${t.title}`);
      skipped += 1;
      continue;
    }

    const { error } = await admin.from("slots").insert({
      host_id: hostId,
      place_id: place.id,
      activity_type: "dog_walk",
      title: t.title,
      description: t.description,
      date_time: slotDateTime(t.daysFromNow, t.hour),
      location_name: place.name,
      location_lat: place.lat,
      location_lng: place.lng,
      max_spots: 6,
      min_reliability: 0,
      min_level: 0,
      gender_scope: "any",
      status: "open",
    });

    if (error) {
      console.error(`  failed: ${t.title} — ${error.message}`);
    } else {
      console.log(`  created: ${t.title} @ ${place.name}`);
      created += 1;
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
