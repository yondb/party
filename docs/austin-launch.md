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

### 4. Marketing week 1 (manual)

| Channel | Action |
|---------|--------|
| Reddit | r/Austin, r/AustinPets, r/dogs — link `?utm_source=reddit` |
| Facebook | Austin Dog Owners / ATX Dogs — link to a seeded slot |
| TikTok/Reels | Screen record: map → create slot → Share button |
| Nextdoor | One neighborhood dog-park invite |

**Post copy hook:** *Sunday Zilker loop — friendly dogs welcome. Join on ifparty.com*

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
