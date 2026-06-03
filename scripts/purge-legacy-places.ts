/**
 * Remove places outside launch market (e.g. Warsaw). Run before Austin import.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Run: npm run purge:legacy-places
 * Windows TLS: IMPORT_PLACES_INSECURE_TLS=1 npm run purge:legacy-places
 */

import { createClient } from "@supabase/supabase-js";
import { MARKET_CITY } from "../lib/market.ts";
import { loadEnvLocal } from "./load-env.ts";

loadEnvLocal();

if (process.env.IMPORT_PLACES_INSECURE_TLS === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn("WARNING: TLS verification disabled (IMPORT_PLACES_INSECURE_TLS=1)");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const admin = createClient(url, key);
  const { count, error } = await admin
    .from("places")
    .delete({ count: "exact" })
    .neq("city", MARKET_CITY);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log(`Deleted ${count ?? 0} places where city != "${MARKET_CITY}".`);
  console.log("Next: npm run import:places (Austin OSM)");
}

main();
