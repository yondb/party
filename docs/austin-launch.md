# Austin launch — deployment checklist (A → Z)

**Position:** Dog walks & outdoor crews in Austin — English-only UI.

---

## ✅ Done in repo (dev — shipped on `master`)

| Item | Status |
|------|--------|
| English-only UI | ✅ |
| Austin filter (`MARKET_CITY=austin`) | ✅ |
| `dog_walk` category + migrations | ✅ |
| Share panel, UTM URLs, OG metadata | ✅ |
| Feed empty-state CTA | ✅ |
| Map **Nearby** + location consent | ✅ |
| CI (`npm run test`) | ✅ |
| One-shot SQL: `supabase/scripts/austin-launch-all.sql` | ✅ |
| Scripts: `npm run austin:setup` (purge → import → seed slots) | ✅ |
| `npm run seed:marketing-slots` (6 dog_walk launch slots) | ✅ |

---

## 📋 Your tasks (cannot be done from code alone)

### 1. Supabase SQL (5 min)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste & run entire file: **`supabase/scripts/austin-launch-all.sql`**
3. Verify:

```sql
select city, category, count(*) from places group by 1,2 order by 1,2;
```

### 2. Austin places + marketing slots (terminal, ~15–30 min)

In `.env.local`: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, **`MARKETING_HOST_EMAIL`** (your login email).

```powershell
$env:IMPORT_PLACES_INSECURE_TLS="1"
npm run austin:setup
```

Or step by step: `purge:legacy-places` → `import:places` → `seed:marketing-slots`

### 3. Smoke test production (5 min)

After Vercel deploy from latest `master`:

1. `/landing` — English hero
2. `/map` — **Nearby** → allow location → sorted places
3. `/feed` — slots or empty CTA
4. `/slots/[id]` — **Share** copies link with `utm_source=share`
5. Create one new `dog_walk` slot yourself

### 4. Growth loop (automated — no manual posts)

1. Run SQL migration: `supabase/migrations/20250602_growth_events.sql` (or re-run `austin-launch-all.sql` if updated)
2. Vercel env: `CRON_SECRET` (random string), existing `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy — crons in `vercel.json`:
   - **Digest** daily 15:00 UTC — emails users with `marketing_opt_in` about matching open slots
   - **Host nudge** hourly — email host if slot has 0 applications after 2h
   - **Lifecycle** every 15 min — auto-complete past slots
4. Users opt in under **Settings → marketing emails**
5. Share links point to **`/invite/[slotId]`** (public, works without login)

### 5. Metrics (optional but recommended)

- Watch Vercel analytics / add GA4 or Plausible when ready
- Target: **1 share per 5 slots** in 30 days
- UTM params already on share links (`utm_source`, `utm_medium`, `utm_campaign`)

---

## Quick reference

| Command | Purpose |
|---------|---------|
| `npm run austin:setup` | Purge non-Austin → OSM import → 6 marketing slots |
| `npm run seed:marketing-slots` | Re-seed slots only (skips duplicates) |
| `npm run import:places -- --category=dog_walk` | Import one category |
