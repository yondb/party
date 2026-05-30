/**
 * Removes ALL fake/demo content: deletes every auth user whose email ends with
 * @lfparty.dev (the demo hosts), which cascades to their slots and applications.
 * Real places (OSM imports) and real user accounts are left untouched.
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: npm run purge:demo
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

const DEMO_DOMAIN = "lfparty.dev";

async function count(table: string): Promise<number> {
  const { count: c } = await admin.from(table).select("id", { count: "exact", head: true });
  return c ?? 0;
}

async function main() {
  console.log("== PURGE DEMO ==");
  console.log(
    `Przed: sloty=${await count("slots")}, aplikacje=${await count("applications")}, miejsca=${await count("places")}`,
  );

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const demo = data.users.filter((u) => (u.email ?? "").endsWith(`@${DEMO_DOMAIN}`));
  let deleted = 0;
  for (const u of demo) {
    const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
    if (delErr) {
      console.error(`  Nie udało się usunąć ${u.email}:`, delErr.message);
      continue;
    }
    deleted++;
  }
  console.log(`Usunięto ${deleted}/${demo.length} demo-userów (kaskadowo ich sloty/aplikacje).`);

  console.log(
    `Po: sloty=${await count("slots")}, aplikacje=${await count("applications")}, miejsca=${await count("places")}`,
  );
  console.log("Gotowe — fejkowe spotkania usunięte, realne miejsca nietknięte.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
