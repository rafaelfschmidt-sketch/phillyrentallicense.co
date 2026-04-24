# phillyrentallicense.co

Next.js landing + checkout for Philadelphia rental licenses. Deployed at `phillyrentallicenses.co` (and eventually `apply.hubkey.co`).

Sibling repo: [`HubKey76/HubKey-Hub`](https://github.com/HubKey76/HubKey-Hub) — the HubKey admin dashboard. Both repos share the same Supabase backend, so submissions captured here flow into the HubKey admin pipeline automatically.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
# open http://localhost:3000/apply/rental-license
```

## What's here

- **Landing page** — `src/app/(public)/apply/rental-license/page.tsx` with variant-aware hero (A/B), AddressTool (merged compliance + pricing), trust bar, value stack, testimonials, FAQ, CTA.
- **Checkout flow** — intake form → Stripe Checkout Session → webhook handler that writes to Supabase, posts to Slack, creates a Google Drive folder, sends confirmation emails.
- **Admin progress** — password-protected `/admin/progress` page showing leads, applications, variant performance, and revenue.
- **Middleware** — `src/middleware.ts` handles A/B variant assignment and admin-route auth.

## Full project doc

See [`docs/landing-v2/LANDING_V2.md`](docs/landing-v2/LANDING_V2.md) for the full finish-line checklist, env var list, backend flow, smoke tests, and A/B plan.

## Environment variables

See `.env.example` for the full list. Minimum to run the landing:
- Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Stripe test keys (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`)
- Resend (`RESEND_API_KEY`)
- Slack (`SLACK_WEBHOOK_URL`)
- `ADMIN_PASSWORD` — gates `/admin/*` routes
- `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` (optional, code no-ops without)

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run lint     # eslint
```
