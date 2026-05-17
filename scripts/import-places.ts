/**
 * Import Warsaw venues from OpenStreetMap (Overpass API) into Supabase `places`.
 *
 * Requires in .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run import:places
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

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

/** Exactly 7 OSM categories — no board_games. */
const queries: Record<
  "running" | "cycling" | "gym" | "padel" | "tennis" | "basketball" | "hiking",
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
    [out:json][timeout:60];
    (
      node["leisure"="fitness_centre"](${CITY_BBOX});
      node["leisure"="sports_centre"](${CITY_BBOX});
    );
    out center 40;
  `,
  padel: `
    [out:json][timeout:60];
    (
      node["sport"="padel"](${CITY_BBOX});
      node["leisure"="pitch"]["sport"="padel"](${CITY_BBOX});
    );
    out center 20;
  `,
  tennis: `
    [out:json][timeout:60];
    (
      node["sport"="tennis"](${CITY_BBOX});
      way["leisure"="pitch"]["sport"="tennis"](${CITY_BBOX});
    );
    out center 30;
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
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function fetchFromOverpass(query: string) {
  let lastError: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!response.ok) {
        throw new Error(`Overpass HTTP ${response.status} (${url})`);
      }
      return (await response.json()) as { elements?: OsmElement[] };
    } catch (e) {
      lastError = e;
      console.warn(`  Overpass mirror failed: ${url}`);
    }
  }
  throw lastError;
}

async function importPlaces() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const categories = Object.keys(queries) as (keyof typeof queries)[];
  console.log(`Importing ${categories.length} categories: ${categories.join(", ")}`);

  for (const category of categories) {
    const query = queries[category];
    console.log(`Importing ${category}...`);

    let data: { elements?: OsmElement[] };
    try {
      data = await fetchFromOverpass(query);
    } catch (e) {
      console.error(`Overpass failed for ${category}:`, e);
      await new Promise((r) => setTimeout(r, 2000));
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
          name: el.tags?.name || el.tags?.["name:en"] || `${category} spot`,
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
      const { error } = await supabase.from("places").upsert(places, { onConflict: "osm_id" });
      if (error) console.error(`Error importing ${category}:`, error.message);
      else console.log(`✓ Imported ${places.length} places for ${category}`);
    } else {
      console.log(`— No places for ${category}`);
    }

    await new Promise((r) => setTimeout(r, 1200));
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
