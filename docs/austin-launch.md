# Austin launch — deployment checklist (A → Z)

**Position:** Dog walks & outdoor crews in Austin — English-only UI.

## A. Code & CI

- [x] English-only UI (no PL toggle)
- [x] Austin market filter (`MARKET_CITY=austin`)
- [x] `dog_walk` category + migration `20250601_austin_dog_walk.sql`
- [x] Growth loop: share panel, UTM URLs, OG metadata, CI (`npm run test`)
- [x] Map nearby panel with location consent

**Deploy:** push `master` → Vercel auto-build.

## B. Supabase (run in SQL editor, in order)

1. `20250530_nine_free_categories.sql` (if not applied)
2. `20250530_consolidate_patches.sql`
3. `20250601_austin_dog_walk.sql` — **drop constraint → update → add constraint**

Verify:

```sql
select city, category, count(*) from places group by 1,2 order by 1,2;
select conname from pg_constraint where conname like '%places_category%';
```

## C. Places data (local terminal)

```powershell
$env:IMPORT_PLACES_INSECURE_TLS="1"   # Windows TLS workaround
npm run purge:legacy-places           # remove non-Austin rows
npm run import:places                 # all 9 categories from Overpass
```

Or manual cleanup:

```sql
delete from places where city != 'austin';
```

## D. Seed marketing slots

Create 5–10 `dog_walk` slots manually at: Zilker, Auditorium Shores, Red Bud Isle, Mueller Lake Park, Shoal Creek.

## E. Marketing (week 1)

| Channel | Action |
|---------|--------|
| Reddit | r/Austin, r/AustinPets, r/dogs — link with `?utm_source=reddit` |
| Facebook | Austin Dog Owners / ATX Dogs groups |
| TikTok/Reels | Map pin → create crew → share button |
| Nextdoor | One neighborhood dog-park invite |

## F. Copy (EN)

- Hero: *Find your crew for dog walks, runs, and parks in Austin.*
- CTA: *Create a meetup → share the link → fill your party.*
- Dog hook: *Sunday Zilker loop — friendly dogs welcome.*

## G. Metrics

Track: UTM share clicks, signups, slots created. Target: **1 share / 5 slots** in 30 days.

## H. Post-launch smoke test

1. `/landing` — English hero
2. `/map` — Nearby → allow location → sorted places
3. `/slots/new` — create dog_walk slot at Austin place
4. `/slots/[id]` — Share panel copies link with UTM
5. `/feed` — empty state CTA to map
