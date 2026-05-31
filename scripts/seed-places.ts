/**
 * Niezawodny import miejsc z pliku data/places-warsaw.json (bez Overpass API).
 *
 * Wymaga .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run seed:places
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { loadEnvLocal } from "./load-env.ts";

loadEnvLocal();

if (process.env.IMPORT_PLACES_INSECURE_TLS === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn("WARNING: TLS verification disabled (IMPORT_PLACES_INSECURE_TLS=1)");
}

type PlaceRow = {
  name: string;
  category: string;
  lat: number;
  lng: number;
  district?: string;
  osm_id: string;
};

const BATCH = 50;

/**
 * Free-only outdoor categories. The bundled JSON predates the free-only model
 * and contains paid venues (padel, tennis, indoor gyms) — skip those here.
 * Outdoor gyms come from `npm run import:places` (leisure=fitness_station).
 */
const FREE_SEED_CATEGORIES = ["running", "cycling", "basketball", "hiking"];

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w .env.local");
    process.exit(1);
  }

  const jsonPath = resolve(process.cwd(), "data/places-warsaw.json");
  const raw = (JSON.parse(readFileSync(jsonPath, "utf8")) as PlaceRow[]).filter((p) =>
    FREE_SEED_CATEGORIES.includes(p.category),
  );

  const places = raw.map((p) => ({
    name: p.name,
    category: p.category,
    lat: p.lat,
    lng: p.lng,
    city: "warsaw",
    district: p.district ?? null,
    is_free: true,
    osm_id: p.osm_id,
  }));

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  console.log(`Wgrywam ${places.length} miejsc z places-warsaw.json…`);

  let saved = 0;
  for (let i = 0; i < places.length; i += BATCH) {
    const batch = places.slice(i, i + BATCH);
    const { error } = await supabase.from("places").upsert(batch, { onConflict: "osm_id" });
    if (error) {
      console.error("Błąd Supabase:", error.message);
      if (error.message.includes("ON CONFLICT")) {
        console.error("Uruchom w SQL: supabase/migrations/20250519_places_osm_id_constraint.sql");
      }
      process.exit(1);
    }
    saved += batch.length;
    process.stdout.write(`\r  ${saved}/${places.length}`);
  }
  console.log("\n✓ Gotowe.");

  const { data } = await supabase.from("places").select("category");
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  console.log("\nW bazie (wszystkie miejsca):");
  for (const cat of [
    "running",
    "cycling",
    "gym",
    "basketball",
    "hiking",
    "playground",
    "walking",
    "football",
    "park",
  ]) {
    console.log(`  ${cat}: ${counts[cat] ?? 0}`);
  }
  console.log(`  RAZEM: ${data?.length ?? 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
