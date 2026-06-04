# Growth loop — live status

**Last updated:** auto by agent. Open this file to see what runs without your hand.

## Automated (Vercel Hobby = 2 crons, 1×/day each)

| Cron | Schedule (UTC) | What it does |
|------|----------------|--------------|
| `job=all` | 06:00 | supply + social + digest + reengage + lifecycle |
| `job=nudge` | 15:00 | host share nudge (0 apps after 2h) |

## Viral (product)

- Share → `/invite/[id]` (public, OG image)
- Signup saves UTM + `referred_by_slot_id`
- Events in `growth_events` → Admin funnel (7d)

## Your env (once)

```
CRON_SECRET=...
RESEND_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
MARKETING_HOST_EMAIL=you@example.com
```

## SQL (once)

1. `supabase/migrations/20250602_growth_events.sql`
2. `supabase/migrations/20250603_growth_content_queue.sql`

## Test cron manually

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" "https://lfparty.com/api/cron/growth?job=all"
```

## Social posts

Auto-generated in `growth_content_queue` (status `ready`).  
**Posting to Reddit/FB still needs API or Buffer** — copy is ready, not auto-published (ToS risk).

## Admin

`/admin` → Growth funnel + copy queue (if migration applied).
