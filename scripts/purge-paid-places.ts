/**
 * Removes paid / non-free venue types from the public map:
 * - padel, tennis (always paid courts)
 * - gym rows from old imports (indoor fitness centres — not outdoor stations)
 *
 * Free outdoor categories kept: running, cycling, basketball, hiking.
 * Re-add outdoor gyms via: npm run import:places -- --category=gym
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: npm run purge:paid-places
 */

import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env.ts";

loadEnvLocal();

if (process.env.IMPORT_PLACES_INSECURE_TLS === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w .env.local");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const REMOVE_CATEGORIES = ["padel", "tennis", "gym"] as const;

async function countByCategory() {
  const { data } = await admin.from("places").select("category");
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  return counts;
}

async function main() {
  console.log("== PURGE PAID PLACES ==");
  const before = await countByCategory();
  console.log("Przed:", before);

  for (const cat of REMOVE_CATEGORIES) {
    const { error, count } = await admin.from("places").delete({ count: "exact" }).eq("category", cat);
    if (error) {
      console.error(`Błąd usuwania ${cat}:`, error.message);
    } else {
      console.log(`Usunięto ${count ?? 0} miejsc (${cat})`);
    }
  }

  const after = await countByCategory();
  console.log("\nPo:", after);
  console.log("Gotowe. Siłownie plenerowe można dociągnąć: npm run import:places -- --category=gym",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
