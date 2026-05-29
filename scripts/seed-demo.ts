/**
 * Demo content seed: hosts + upcoming slots + applications, so the map / feed
 * feel alive. Idempotent — wipes previous demo data (users @lfparty.dev and
 * everything they cascade) before recreating.
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: npm run seed:demo
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

type DemoHost = {
  name: string;
  gender: "male" | "female";
  bio: string;
  reliability: number;
  exp: number;
};

const HOSTS: DemoHost[] = [
  { name: "Ania", gender: "female", bio: "Biegam o poranku, szukam ekipy na regularne treningi.", reliability: 0.97, exp: 1450 },
  { name: "Kuba", gender: "male", bio: "Koszykówka i siłownia. Zawsze na czas.", reliability: 0.92, exp: 980 },
  { name: "Maja", gender: "female", bio: "Tenis i padel. Poziom średniozaawansowany.", reliability: 0.99, exp: 2100 },
  { name: "Kamil", gender: "male", bio: "Rower szosowy w weekendy, dłuższe trasy.", reliability: 0.88, exp: 640 },
  { name: "Ola", gender: "female", bio: "Joga, bieganie i długie spacery po mieście.", reliability: 0.95, exp: 1190 },
  { name: "Tomek", gender: "male", bio: "Streetball na Pradze, gram od lat.", reliability: 0.9, exp: 720 },
  { name: "Zofia", gender: "female", bio: "Trekking i wędrówki — uciekam z miasta gdy mogę.", reliability: 0.96, exp: 1620 },
  { name: "Piotr", gender: "male", bio: "FBW i push/pull. Trenuję 4x w tygodniu.", reliability: 0.85, exp: 430 },
];

const TITLES: Record<string, string[]> = {
  running: ["Poranny bieg", "Wieczorny trucht", "Interwały na bieżni", "Spokojne 5K", "Długie wybieganie"],
  cycling: ["Rowerowa przejażdżka", "Szybkie kółko po mieście", "Weekendowa trasa", "Wieczorna jazda"],
  gym: ["Wspólny trening", "Push day", "Trening nóg", "FBW dla każdego", "Pull day"],
  padel: ["Padel 2v2", "Padel dla początkujących", "Mecz padla", "Sparing padlowy"],
  tennis: ["Tenis — singiel", "Debel wieczorny", "Sparing tenisowy", "Trening serwisu"],
  basketball: ["Koszykówka 3x3", "Streetball", "Mecz do 21", "Rzuty i gra"],
  hiking: ["Spacer po parku", "Wędrówka weekendowa", "Trekking za miasto", "Marsz na świeżym powietrzu"],
};

const DESCRIPTIONS = [
  "Luźny poziom, liczy się dobra atmosfera.",
  "Zapraszam wszystkich chętnych — pogadamy i pozwiedzamy.",
  "Średnie tempo, bez wyścigów.",
  "Jak ktoś chce poćwiczyć w ekipie, to się piszcie!",
  "",
  "Po treningu można wpaść na kawę.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function wipePreviousDemo() {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const demo = data.users.filter((u) => (u.email ?? "").endsWith(`@${DEMO_DOMAIN}`));
  for (const u of demo) {
    await admin.auth.admin.deleteUser(u.id);
  }
  console.log(`Wyczyszczono ${demo.length} poprzednich demo-userów (kaskadowo sloty/aplikacje).`);
}

async function createHosts(): Promise<{ id: string; name: string }[]> {
  const created: { id: string; name: string }[] = [];
  for (let i = 0; i < HOSTS.length; i++) {
    const h = HOSTS[i];
    const email = `demo.${h.name.toLowerCase()}@${DEMO_DOMAIN}`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: `Demo!${Math.random().toString(36).slice(2, 12)}`,
      email_confirm: true,
      user_metadata: { name: h.name, setup_done: true, preferred_activities: [] },
    });
    if (error || !data.user) {
      console.error(`Nie udało się utworzyć ${email}:`, error?.message);
      continue;
    }
    const level = Math.floor(h.exp / 300) + 1;
    await admin
      .from("users")
      .update({
        name: h.name,
        gender: h.gender,
        bio: h.bio,
        reliability_score: h.reliability,
        exp: h.exp,
        level,
        total_activities: randInt(3, 25),
        total_hosted: randInt(1, 12),
      })
      .eq("id", data.user.id);
    created.push({ id: data.user.id, name: h.name });
  }
  console.log(`Utworzono ${created.length} demo-hostów.`);
  return created;
}

type PlaceLite = { id: string; name: string; category: string; lat: number; lng: number };

async function fetchPlaces(): Promise<PlaceLite[]> {
  const { data, error } = await admin.from("places").select("id, name, category, lat, lng");
  if (error) throw error;
  return (data ?? []) as PlaceLite[];
}

async function createSlots(hosts: { id: string; name: string }[], places: PlaceLite[]) {
  const byCategory = new Map<string, PlaceLite[]>();
  for (const p of places) {
    const arr = byCategory.get(p.category) ?? [];
    arr.push(p);
    byCategory.set(p.category, arr);
  }
  const categories = Array.from(byCategory.keys());
  const slotIds: { id: string; hostId: string }[] = [];
  const TOTAL = 32;

  for (let i = 0; i < TOTAL; i++) {
    const category = pick(categories);
    const placePool = byCategory.get(category) ?? [];
    if (placePool.length === 0) continue;
    const place = pick(placePool);
    const host = pick(hosts);
    const hoursAhead = randInt(2, 240);
    const date = new Date(Date.now() + hoursAhead * 3_600_000);
    date.setMinutes(pick([0, 15, 30, 45]));
    const maxSpots = randInt(2, 8);

    const { data, error } = await admin
      .from("slots")
      .insert({
        host_id: host.id,
        activity_type: category,
        title: pick(TITLES[category] ?? ["Aktywność"]),
        description: pick(DESCRIPTIONS) || null,
        date_time: date.toISOString(),
        location_name: place.name,
        location_lat: place.lat,
        location_lng: place.lng,
        max_spots: maxSpots,
        min_reliability: 0,
        min_level: 0,
        status: "open",
        gender_scope: "any",
      })
      .select("id, host_id")
      .single();
    if (error || !data) {
      console.error("Slot insert error:", error?.message);
      continue;
    }
    slotIds.push({ id: data.id, hostId: data.host_id });
  }
  console.log(`Utworzono ${slotIds.length} slotów.`);
  return slotIds;
}

async function createApplications(
  slots: { id: string; hostId: string }[],
  hosts: { id: string; name: string }[],
) {
  let pending = 0;
  let accepted = 0;
  for (const slot of slots) {
    // ~60% of slots get applicants
    if (Math.random() > 0.6) continue;
    const candidates = hosts.filter((h) => h.id !== slot.hostId);
    const n = randInt(1, Math.min(3, candidates.length));
    const shuffled = [...candidates].sort(() => Math.random() - 0.5).slice(0, n);
    for (let i = 0; i < shuffled.length; i++) {
      const applicant = shuffled[i];
      const { data, error } = await admin
        .from("applications")
        .insert({ slot_id: slot.id, applicant_id: applicant.id, status: "pending", message: null })
        .select("id")
        .single();
      if (error || !data) continue;
      pending++;
      // accept the first applicant on ~half of those slots (fires trigger → spots_taken++)
      if (i === 0 && Math.random() > 0.5) {
        const { error: upErr } = await admin
          .from("applications")
          .update({ status: "accepted" })
          .eq("id", data.id);
        if (!upErr) {
          accepted++;
          pending--;
        }
      }
    }
  }
  console.log(`Utworzono aplikacje: ${accepted} zaakceptowanych, ${pending} oczekujących.`);
}

async function main() {
  console.log("== DEMO SEED ==");
  await wipePreviousDemo();
  const hosts = await createHosts();
  if (hosts.length === 0) {
    console.error("Brak hostów — przerywam.");
    process.exit(1);
  }
  const places = await fetchPlaces();
  console.log(`Miejsc w bazie: ${places.length}`);
  const slots = await createSlots(hosts, places);
  await createApplications(slots, hosts);

  const { count: slotCount } = await admin
    .from("slots")
    .select("id", { count: "exact", head: true });
  const { count: appCount } = await admin
    .from("applications")
    .select("id", { count: "exact", head: true });
  console.log(`\nGotowe. Slotów w bazie: ${slotCount}, aplikacji: ${appCount}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
