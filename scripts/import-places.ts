/**
 * Import Warsaw venues from OpenStreetMap (Overpass API) into Supabase `places`.
 *
 * Requires in env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run import:places
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const CITY = "warsaw";
/** south,west,north,east */
const CITY_BBOX = "52.0978,20.8515,52.3682,21.2711";

const queries: Record<string, string> = {
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
  board_games: `
    [out:json][timeout:60];
    (
      node["shop"="games"](${CITY_BBOX});
      node["amenity"="library"](${CITY_BBOX});
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

async function fetchFromOverpass(query: string) {
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!response.ok) {
    throw new Error(`Overpass HTTP ${response.status}`);
  }
  return response.json() as Promise<{ elements?: OsmElement[] }>;
}

async function importPlaces() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  for (const [category, query] of Object.entries(queries)) {
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
        const osm_id = `${el.id}`;
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

  console.log("Import complete.");
}

importPlaces().catch((e) => {
  console.error(e);
  process.exit(1);
});
