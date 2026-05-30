/**
 * Opcjonalny import z OpenStreetMap (Overpass) — często 429 z domu.
 * Zalecane: npm run seed:places (data/places-warsaw.json, bez API).
 *
 * Requires in .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: npm run import:places
 */

import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env.ts";

loadEnvLocal();

/** Windows / corporate proxy TLS: run with IMPORT_PLACES_INSECURE_TLS=1 */
if (process.env.IMPORT_PLACES_INSECURE_TLS === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn("WARNING: TLS verification disabled (IMPORT_PLACES_INSECURE_TLS=1)");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const CITY = "warsaw";
/** south,west,north,east */
const CITY_BBOX = "52.0978,20.8515,52.3682,21.2711";

/**
 * FREE activities only — places where you don't pay a venue fee.
 * Paid venues (indoor gyms, courts, padel, cafes) are excluded; they are a
 * future upsell (businesses pay for their pin). "gym" = OUTDOOR street-workout
 * / fitness stations (leisure=fitness_station), which are free public spots.
 */
const queries: Record<
  "running" | "cycling" | "gym" | "basketball" | "hiking",
  string
> = {
  running: `
    [out:json][timeout:60];
    (
      way["leisure"="track"]["sport"="running"](${CITY_BBOX});
      way["route"="running"](${CITY_BBOX});
      node["leisure"="park"](${CITY_BBOX});
    );
    out center 50;
  `,
  cycling: `
    [out:json][timeout:60];
    (
      way["highway"="cycleway"](${CITY_BBOX});
      node["amenity"="bicycle_parking"](${CITY_BBOX});
    );
    out center 30;
  `,
  gym: `
    [out:json][timeout:90];
    node["leisure"="fitness_station"](${CITY_BBOX});
    out 80;
  `,
  basketball: `
    [out:json][timeout:60];
    (
      node["sport"="basketball"](${CITY_BBOX});
      way["leisure"="pitch"]["sport"="basketball"](${CITY_BBOX});
    );
    out center 40;
  `,
  hiking: `
    [out:json][timeout:60];
    (
      way["route"="hiking"](${CITY_BBOX});
      node["leisure"="nature_reserve"](${CITY_BBOX});
    );
    out center 20;
  `,
};

type OsmElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const OVERPASS_USER_AGENT = "lfparty/1.0 (https://lfparty.com; places import)";

const OVERPASS_DELAY_MS = 12_000;
const OVERPASS_429_WAIT_MS = 30_000;
const OVERPASS_MAX_429_RETRIES = 2;
const BATCH_SIZE = 40;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Visible countdown so the terminal does not look frozen. */
async function sleepWithCountdown(label: string, ms: number) {
  const step = 5000;
  let left = ms;
  while (left > 0) {
    const chunk = Math.min(step, left);
    await sleep(chunk);
    left -= chunk;
    process.stdout.write(`\r  ${label} ${Math.ceil(left / 1000)}s…   `);
  }
  process.stdout.write("\n");
}

async function fetchFromOverpass(query: string, attempt = 1): Promise<{ elements?: OsmElement[] }> {
  let lastError: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": OVERPASS_USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (response.status === 504 || response.status === 502) {
        console.warn(`  Overpass timeout (${response.status}) on ${url}, próbuję następny mirror…`);
        continue;
      }
      if (response.status === 429) {
        if (attempt >= OVERPASS_MAX_429_RETRIES) {
          throw new Error(`Overpass HTTP 429 — limit API, pomijam po ${attempt} próbach`);
        }
        console.warn(`  Limit Overpass (429), czekam ${OVERPASS_429_WAIT_MS / 1000}s (próba ${attempt}/${OVERPASS_MAX_429_RETRIES})…`);
        await sleepWithCountdown("Pozostało", OVERPASS_429_WAIT_MS);
        return fetchFromOverpass(query, attempt + 1);
      }
      if (!response.ok) {
        throw new Error(`Overpass HTTP ${response.status} (${url})`);
      }
      return (await response.json()) as { elements?: OsmElement[] };
    } catch (e) {
      lastError = e;
      console.warn(`  Overpass mirror failed: ${url} — ${e instanceof Error ? e.message : e}`);
    }
  }
  throw lastError;
}

async function savePlaces(
  places: {
    name: string;
    category: string;
    lat: number;
    lng: number;
    city: string;
    is_free: boolean;
    osm_id: string;
  }[],
) {
  let saved = 0;
  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    const batch = places.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("places").upsert(batch, { onConflict: "osm_id" });
    if (error) {
      console.error(`  DB error (batch ${i / BATCH_SIZE + 1}):`, error.message);
      if (error.message.includes("ON CONFLICT") || error.message.includes("unique")) {
        console.error(
          "  → Uruchom w Supabase SQL: supabase/migrations/20250519_places_osm_id_constraint.sql",
        );
      }
      return saved;
    }
    saved += batch.length;
  }
  return saved;
}

async function importPlaces() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const onlyArg = process.argv.find((a) => a.startsWith("--category="));
  const onlyCategory =
    process.env.IMPORT_ONLY?.trim() || onlyArg?.slice("--category=".length);
  let categories = Object.keys(queries) as (keyof typeof queries)[];
  if (onlyCategory) {
    if (!(onlyCategory in queries)) {
      console.error(`Unknown category: ${onlyCategory}. Use: ${categories.join(", ")}`);
      process.exit(1);
    }
    categories = [onlyCategory as keyof typeof queries];
  }

  console.log(`Importing ${categories.length} categories: ${categories.join(", ")}`);
  console.log("(Ctrl+C = stop. Map already works if seed or running import succeeded.)\n");

  for (const category of categories) {
    const query = queries[category];
    console.log(`Importing ${category}...`);

    let data: { elements?: OsmElement[] };
    try {
      data = await fetchFromOverpass(query);
    } catch (e) {
      console.error(`Overpass failed for ${category}:`, e);
      await sleep(OVERPASS_DELAY_MS);
      continue;
    }

    const elements = data.elements ?? [];
    const seen = new Set<string>();
    const places = elements
      .filter((el) => {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        return lat != null && lng != null;
      })
      .map((el) => {
        const lat = el.lat ?? el.center!.lat;
        const lng = el.lon ?? el.center!.lon;
        const osm_id = String(el.id);
        return {
          name: el.tags?.name || el.tags?.["name:en"] || `${category === "gym" ? "outdoor gym" : category} spot`,
          category,
          lat,
          lng,
          city: CITY,
          is_free: true,
          osm_id,
        };
      })
      .filter((p) => {
        if (seen.has(p.osm_id)) return false;
        seen.add(p.osm_id);
        return true;
      });

    if (places.length > 0) {
      const saved = await savePlaces(places);
      if (saved > 0) console.log(`✓ Saved ${saved} places for ${category}`);
    } else {
      console.log(`— No places for ${category}`);
    }

    await sleep(OVERPASS_DELAY_MS);
  }

  const { data: summary } = await supabase.from("places").select("category");
  const counts: Record<string, number> = {};
  for (const row of summary ?? []) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  console.log("\nSummary by category:");
  for (const cat of categories) {
    console.log(`  ${cat}: ${counts[cat] ?? 0}`);
  }
  console.log("Import complete.");
}

importPlaces().catch((e) => {
  console.error(e);
  process.exit(1);
});
