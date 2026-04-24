# TODO — phillyrentallicense.co

> Primary tracking lives in [`docs/landing-v2/LANDING_V2.md`](docs/landing-v2/LANDING_V2.md) — finish-line checklist, env vars, backend flow, smoke tests, A/B plan.
>
> This file holds anything **outside** the main Landing V2 scope (future features, bugs, cleanup tasks).

## Next up

- [ ] Connect this repo's own Vercel project (separate from HubKey's)
- [ ] Set `ADMIN_PASSWORD` env var so the `/admin/progress` dashboard can be accessed
- [ ] Point `phillyrentallicenses.co` DNS at Vercel once registrar access is sorted
- [ ] First smoke test after first deploy (see LANDING_V2.md 7-step sequence)

## Admin dashboard — future improvements

The v0 `/admin/progress` page is functional but minimal. Future enhancements worth considering:
- [ ] Date range picker (currently hard-coded to 7 days)
- [ ] CSV export of leads + applications
- [ ] Funnel chart showing step-by-step conversion (currently shown as raw counts)
- [ ] Per-variant conversion rate table (not just lead counts by variant)
- [ ] Alerts / Slack digest ("5 new leads today, 1 paid")
- [ ] Click-through to application detail view (currently read-only table)
- [ ] Upgrade auth from shared password → per-user Supabase accounts

## Content

- [ ] Move `legacy/DESIGN.md` insights into the copy / style direction doc (if any details there should inform ongoing design)
- [ ] Decide what to do with `legacy/index.html` (the Stitch-export static prototype) — delete, archive, or use as style reference?
