# phillyrentallicense.co — Claude context

## What this repo is
Next.js 16 landing page + Stripe checkout for Philadelphia rental licenses. Served on `phillyrentallicenses.co` (apex) and eventually `apply.hubkey.co` (checkout subdomain, pending DNS).

## Relationship to HubKey Hub
- Sibling repo: `HubKey76/HubKey-Hub` (the HubKey admin app).
- **Shared Supabase backend** — this repo writes to the same `rental_license_applications`, `application_units`, `application_notes`, and `landing_page_leads` tables that the HubKey admin reads from. Submissions captured here flow to the admin pipeline automatically.
- **Shared Stripe account** — same keys used in both repos. This repo owns the webhook endpoint (once DNS is live).
- **Shared email / Slack / Drive** — all external integrations use the same credentials.

## Brand colors
- Primary teal: `#50b8a2`
- Accent purple: `#6750a1`
- Foreground dark: `#333543`
- Border light: `#e2e3e7`
- Warm bg: `#f7f6f3`

## Key domains
- `phillyrentallicenses.co` — public landing (this repo's primary domain)
- `apply.hubkey.co` — planned checkout subdomain (same deployment, second custom domain)
- `hubkey.co/services/philadelphia-rental-license-services/` — WordPress SEO page, not in this repo; its "Get Started" button will eventually link to `apply.hubkey.co`

## Critical rules (don't break these)
- **Pricing source of truth**: `src/lib/pricing.ts`. License fee: $500 flat. City fee: $69/unit. Lead paint test (pre-1978 only): $130/$160/$195/$220/$255/$280 for 0/1/2/3/4/5+BR. See `docs/landing-v2/LANDING_V2.md` for the full table.
- **Lead paint billing**: client always pays retail. Never attach the Philly Lead Inspector invoice to the owner's Buildium bill. (The discount HubKey gets from Marsha is HubKey's margin.)
- **Workflow rules**:
  - Always update `CHANGELOG.md` when making code changes.
  - Always update `docs/landing-v2/LANDING_V2.md` when the launch checklist or architecture changes.

## A/B variants (active)
`src/middleware.ts` assigns `lp_variant` cookie to control / v1 / v2 at 33/33/33 on first visit. Each variant renders a different hero headline (same rest of page):
- `control`: "One service to handle your rental license" (solution framing)
- `v1`: "Get your rental license in 3–5 days" (speed framing)
- `v2`: "Don't risk $2,000/day in unlicensed-rental fines" (fear framing)

Manual override: `?v=control|v1|v2`.

## Admin progress dashboard
- Lives at `/admin/progress`, gated by `ADMIN_PASSWORD` env var (simple password + cookie, no Supabase auth yet).
- Reads from `landing_page_leads` + `rental_license_applications` via the service-role Supabase client.
- Shows: 7-day leads, paid applications, revenue, A/B variant split, lead source breakdown, application status pipeline, recent leads, recent applications.

## Key files to know
- `src/middleware.ts` — admin auth gate + A/B variant assignment
- `src/components/landing/address-tool.tsx` — the single consolidated compliance + pricing tool
- `src/components/landing/hero.tsx` — variant-aware hero
- `src/lib/pricing.ts` — pricing math (source of truth)
- `src/lib/email.ts` — Resend templates (payment confirmation, onboarding complete, abandoned cart)
- `src/app/api/stripe/webhook/route.ts` — payment webhook → Supabase + Slack + Drive + email
- `src/app/admin/progress/page.tsx` — admin dashboard
- `docs/landing-v2/LANDING_V2.md` — single source of truth for project status, launch checklist, env vars

## When making changes
- New code should respect the variant-aware pattern (pass `variant` down from server components that read `cookies()`).
- New Supabase tables or columns → add a migration file in `supabase/migrations/` and reference it in the LANDING_V2.md launch checklist.
- New Stripe line items → update `src/app/api/stripe/checkout/route.ts` AND `src/lib/pricing.ts` together.
- New email → add a template in `src/lib/email.ts`, wire it through `/api/email/send`, reference it in LANDING_V2.md.

## Not in scope
This repo is landing + checkout only. Anything admin-side (portfolio, workflows, full rental-license coordinator pipeline, Buildium sync, SOP task tracking) lives in the sibling `hubkeyhub` repo. The `/admin/progress` dashboard here is intentionally lightweight — it's for tracking landing conversion, not running the full rental license process.
