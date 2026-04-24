# Landing V2 — Philly Rental License

**Scope**: Everything related to the public rental-license landing + checkout flow (`phillyrentallicenses.co` + `apply.hubkey.co`). For HubKey-wide admin/portfolio work, see `TODO.md`. For HubKey project spec + pricing tables, see `CLAUDE.md`.

**Current branch**: `feature/landing-v2-engagement` (7 commits ahead of `a4fb1b7`)

**Last updated**: 2026-04-24

---

## Architecture Decision: Two Vercel Projects, Same Repo

**Why**: Ben doesn't have access to the HubKey-owned Vercel project (or the HubKey-owned Stripe account). Rather than wait on access, we deploy the landing from a **separate Vercel project** that Ben controls, still pulling from the same GitHub repo and still writing to the same Supabase backend.

| | HubKey Admin Vercel (existing, HubKey-owned) | Landing Vercel (new, Ben-owned) |
|---|---|---|
| Source repo | `HubKey76/HubKey-Hub` | `HubKey76/HubKey-Hub` (same) |
| Primary domain | `hubkey-hub.vercel.app` | `phillyrentallicenses.co` (+ `apply.hubkey.co` when DNS allows) |
| Supabase | shared project | shared project (same tables) |
| Stripe | HubKey's account (test → live) | same keys, different deployment |
| Who deploys | HubKey owner | Ben |

**How it works**: Middleware (`src/middleware.ts`) already routes by hostname, so each Vercel project serves the correct parts of the app based on which domain the visitor hit. No code changes needed for the split. Submissions from the landing Vercel project write to the same `rental_license_applications` table that the HubKey admin project reads from — leads flow to the admin pipeline seamlessly.

---

## 🏁 Finish-Line Checklist

Every box below has to be checked before flipping the switch.

### Access to unlock (ask humans)
- [ ] `phillyrentallicenses.co` registrar login (find who bought it — Mike? HubKey owner?)
- [ ] HubKey Stripe account — **one of**: invite Ben as Developer role, OR HubKey owner runs Stripe dashboard ops directly, OR pair session
- [ ] WordPress admin access (to flip the "Get Started" button) — may be deferred if we send traffic only to `phillyrentallicenses.co` first
- [ ] `hubkey.co` DNS access — deferred, only needed when adding `apply.hubkey.co` as a second domain

### Ben's Vercel project setup
- [ ] Create new Vercel project under Blue Homes / personal account
- [ ] Connect to GitHub repo `HubKey76/HubKey-Hub`, set production branch (recommend `main` after PR merge)
- [ ] Add custom domain `phillyrentallicenses.co` + `www.phillyrentallicenses.co` once registrar access is resolved
- [ ] Add `apply.hubkey.co` as a second domain once hubkey.co DNS is resolved (later)
- [ ] Copy env vars from `.env` into Vercel project settings (see Env Vars section below)

### Analytics (PostHog)
- [ ] Sign up at https://posthog.com (free tier, 1M events/month). Pick US region.
- [ ] Copy Project API Key (starts with `phc_...`) from Project Settings
- [ ] Paste into Ben's Vercel project env vars (all environments): `NEXT_PUBLIC_POSTHOG_KEY=phc_...` + `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`
- [ ] Optional: paste into local `.env` for local dev event verification
- [ ] After first deploy, click through landing and confirm events in PostHog → Activity
- [ ] Build funnel in PostHog → Insights: `$pageview` → `address_tool_lookup` → `address_tool_checkout_click` → `checkout_complete`, filter by `lp_variant` for A/B analysis

### Analytics (Google Analytics 4) — required for Google Ads
- [ ] Create GA4 property (skip if not running paid Google Ads traffic)
- [ ] Add GA4 script to root layout via `@next/third-parties/google` (not yet installed)
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel
- [ ] Define conversion events: `checkout_complete`, `address_tool_lookup`, `address_tool_checkout_click`

### Email (Resend)
- [ ] Verify `hubkey.co` domain in Resend — requires `hubkey.co` DNS access (SPF + DKIM + DMARC). Deferred if DNS blocked; existing sender `onboarding@resend.dev` may work for initial tests.
- [ ] Test-send each new template: `sendPaymentConfirmation`, `sendOnboardingComplete`, `sendAbandonedCartRecovery`
- [ ] Confirm existing templates still work: `sendRentalLicenseFormRequest`, `sendPHTINReminder`, `sendStatusUpdate`, `sendRLSIRequest`, `sendLicenseComplete`
- [ ] Unsubscribe link + CAN-SPAM compliance check

### Stripe go-live (blocked on HubKey Stripe access)
⚠️ **All items below need HubKey Stripe dashboard access.** Until resolved, we can verify only the "session creation" half locally using the test keys already in `.env`.

- [ ] Register new webhook endpoint in Stripe dashboard pointing at the landing Vercel project's webhook URL (will be something like `phillyrentallicenses.co/api/stripe/webhook` or `apply.hubkey.co/api/stripe/webhook`)
- [ ] Subscribe webhook to `checkout.session.completed`
- [ ] Copy new webhook signing secret → paste into Vercel `STRIPE_WEBHOOK_SECRET`
- [ ] Flip keys from test (`sk_test_` / `pk_test_`) to live (`sk_live_` / `pk_live_`)
- [ ] Smoke-test: one real $1 live-mode charge end-to-end, then refund via dashboard

**What Ben can verify without dashboard access** (using test keys in `.env`):
- [ ] Intake form → "Proceed to checkout" redirects to a `checkout.stripe.com/pay/cs_test_...` URL (validates session creation, ~40% of the flow)
- [ ] Webhook receipt → blocked (requires Stripe CLI + `stripe login`)

### Database (Supabase)
- [ ] Run migration `supabase/migrations/20260420_001_lp_leads_quiz.sql` in Supabase Dashboard → SQL Editor
- [ ] Verify new columns on `landing_page_leads`: `quiz_result`, `variant`, `source_domain`, `source_tool`, `year_built`, `unit_count`, `estimated_total_cents`
- [ ] Confirm RLS policy still allows anonymous inserts from landing

### Auth wall decision
- [ ] Decide: re-enable `src/lib/supabase-middleware.ts` auth wall before merging to main, OR leave disabled while running A/B tests. Landing routes (`/apply/*`) are public either way — only admin routes are gated.

### Content sign-off
- [ ] Confirm testimonials (Maria P., Sarah C., Robert P.) are OK — or swap for real new quotes
- [ ] WordPress "Get Started" button → update to landing URL (deferred if no admin access; traffic can flow via `phillyrentallicenses.co` directly in the meantime)

### Merge + deploy
- [ ] Open PR from `feature/landing-v2-engagement` → `main`
- [ ] Ben's Vercel project auto-builds a preview URL
- [ ] Run the 7-step smoke test (see below) on the preview
- [ ] Merge to main → production deploy

---

## Environment Variables

### Group A — Required for landing + checkout (set these in Ben's Vercel project)
- `NEXT_PUBLIC_SUPABASE_URL` — in `.env`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — in `.env`
- `SUPABASE_SERVICE_ROLE_KEY` — in `.env`
- `STRIPE_SECRET_KEY` — test key in `.env`; flip to live at launch
- `STRIPE_PUBLISHABLE_KEY` — test key in `.env`; flip to live at launch
- `STRIPE_WEBHOOK_SECRET` — test value in `.env`; will change when registering new webhook endpoint
- `RESEND_API_KEY` — in `.env`
- `SLACK_WEBHOOK_URL` — in `.env`
- `NEXT_PUBLIC_APP_URL` — e.g. `https://hubkey-hub.vercel.app` (admin dashboard deep-link fallback)
- `NEXT_PUBLIC_APPLY_URL` — e.g. `https://phillyrentallicenses.co` or later `https://apply.hubkey.co`. Leave unset in preview so code falls back to `window.location.origin`.
- `NEXT_PUBLIC_POSTHOG_KEY` — new, grab from PostHog signup
- `NEXT_PUBLIC_POSTHOG_HOST` — `https://us.i.posthog.com`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — new, grab from GA4 signup (if running Google Ads)

### Group B — Optional, no-op gracefully when unset
- `GOOGLE_SERVICE_ACCOUNT_KEY` — Google Drive folder auto-creation from Stripe webhook. Skipped silently if missing.
- `GOOGLE_DRIVE_RENTAL_LICENSE_FOLDER_ID` — parent folder ID for client folders
- `DOCUMENSO_API_KEY` / `DOCUMENSO_API_BASE` — RLSI e-sign flow (not wired yet)
- `LEADSIMPLE_API_KEY` — legacy, not needed for landing
- `BUILDIUM_CLIENT_ID` + `BUILDIUM_CLIENT_SECRET` — admin-side only

---

## Submissions Landing — Backend Flow

Where submissions go after a user pays:

1. User fills intake at `phillyrentallicenses.co/apply/rental-license/intake` (or `apply.hubkey.co/...` once DNS adds) → clicks checkout
2. `/api/stripe/checkout` creates a Stripe Checkout Session → user redirected to Stripe-hosted pay page
3. User pays → Stripe fires `checkout.session.completed` webhook to Ben's Vercel project at `/api/stripe/webhook`
4. Webhook handler runs:
   - Updates `rental_license_applications.status` → `paid` + records `stripe_payment_intent_id` + `paid_at`
   - Logs system note in `application_notes`
   - Creates Google Drive folder for client (if `GOOGLE_SERVICE_ACCOUNT_KEY` set) + saves URL
   - Posts Slack notification to team channel with property address, owner, amount, dashboard link
   - Sends payment confirmation email to client via Resend with onboarding link
   - Captures `checkout_complete` to PostHog
5. User clicks email link → `/apply/rental-license/onboarding?application_id=...` → fills owner info, PHTIN, lead paint, etc.
6. Onboarding submit → updates application with full details, sets status to `intake_complete` or `awaiting_phtin`, fires second Slack + onboarding-complete email

**Admin team sees submissions via:**
- Supabase dashboard (tables: `rental_license_applications`, `application_units`, `application_notes`)
- Admin app at `/admin/rental-license-only` — Rental License Coordinator's pipeline
- Slack channel — real-time alerts at both payment and onboarding
- Google Drive — auto-created folder per client
- Email — clients get 2 automated emails; team sees Slack only

**Verification checklist (after first deploy):**
- [ ] Stripe test checkout (4242 4242 4242 4242) → confirm Supabase row inserts with correct status
- [ ] Confirm Slack notification fires
- [ ] Confirm Drive folder created (or skipped silently if creds not set)
- [ ] Confirm payment confirmation email lands (if Resend verified)
- [ ] Onboarding submit → second Slack + confirmation email

---

## 7-Step Smoke Test Sequence

Run after the first deploy on Ben's Vercel project:

1. Type `2061 KATER` in the landing address field → confirm autocomplete dropdown
2. Run AddressTool lookup → confirm Supabase row in `landing_page_leads` with `source_tool=address_tool`
3. Click "Lock in this price & start my application" → confirm intake form prefills with address, units, pre1978
4. Optionally test email capture in AddressTool → confirm row with `source_tool=address_tool_email`
5. Intake autocomplete → type, pick a suggestion → confirm compliance + price lookup auto-triggers
6. Complete Stripe test checkout (4242 4242 4242 4242) with webhook forwarding → confirm all downstream effects (Supabase / Slack / Drive / email)
7. Visit `?v=v1` and `?v=v2` → confirm hero headline changes (same layout across variants)

---

## What's Built (status as of 2026-04-24)

### Landing components
- `src/components/landing/hero.tsx` — variant-aware (control / v1 / v2 hero copy)
- `src/components/landing/address-tool.tsx` — consolidated compliance preview + pricing calculator + soft email capture
- `src/components/landing/address-autocomplete.tsx` — Philly OPA-powered typeahead (no Google Places)
- `src/components/landing/problem-section.tsx`, `complexity-section.tsx`, `how-it-works.tsx`, `value-stack.tsx`, `social-proof.tsx`, `pricing-section.tsx`, `faq-section.tsx`, `final-cta.tsx`
- Deprecated but kept in repo: `address-checker.tsx`, `instant-pricing-calculator.tsx`, `phtin-quiz.tsx` — no longer imported, retained for possible cherry-pick

### Middleware
- `src/middleware.ts` — hostname routing (apply/PRL/default) + 33/33/33 random A/B assignment + sticky lp_variant + lp_domain cookies

### Analytics
- `src/lib/posthog.ts` — server-side PostHog helper (`captureServer()`)
- `src/components/posthog-provider.tsx` — client-side provider, registers `lp_variant` + `lp_domain` as super properties
- Vercel Analytics installed via `@vercel/analytics`
- Events wired: `landing_view_server`, `address_tool_lookup`, `address_tool_checkout_click`, `address_tool_email_capture`, `checkout_complete`

### Email (Resend)
- `src/lib/email.ts` — full template set: `sendPaymentConfirmation`, `sendOnboardingComplete`, `sendAbandonedCartRecovery` (new) + existing `sendRentalLicenseFormRequest`, `sendPHTINReminder`, `sendStatusUpdate`, `sendRLSIRequest`, `sendLicenseComplete`
- `/api/email/send` — typed switchboard for all template types
- Stripe webhook + onboarding submit now trigger the new templates

### Database
- `supabase/migrations/20260420_001_lp_leads_quiz.sql` — adds quiz/variant/pricing columns to `landing_page_leads` (needs to be applied in prod)

### API routes
- `/api/philly` — compliance report (retries 5xx once via `fetchWithRetry`, structured error codes)
- `/api/philly/autocomplete` — OPA prefix+contains match with hyphenated-range support
- `/api/stripe/checkout` + `/api/stripe/webhook` — full payment flow including Drive folder + Slack + email
- `/api/email/send` — email template switchboard
- `/api/rental-license` — intake creation + OPA lookup

---

## Open Business Decisions

- [ ] **Upsell for leasing-only clients** — `leasing_only` exists as a $250 discounted service type but has no public-facing upsell copy. Decide: post-purchase upsell / dedicated leasing section / keep private for existing leasing clients only.
- [ ] **Confirm leasing price** — WordPress says "1 month's rent + $250", `pricing.ts` says flat $250. Which is current?
- [ ] **A/B minimum sample size** — suggest 100+ checkout-starts per variant before calling a winner. Confirm with team.
- [ ] **Auth wall during A/B testing** — keep disabled while iterating, or re-enable and handle landing via the already-existing `/apply/*` exemption?

---

## Content & Copy Punch List

- [ ] Expand FAQ from 10 → 20-25 questions (cheap 70% of a chatbot)
- [ ] Confirm testimonials or swap for real new quotes + photos
- [ ] Open Graph image (`public/og-image.png`, 1200×630)
- [ ] Favicon variants for the new domains
- [ ] `robots.txt` + `sitemap.xml`

---

## QA Sweep

- [ ] Mobile responsive check (iPhone Pro Max, Android mid-tier, iPad)
- [ ] Cross-browser: Safari, Chrome, Firefox, Edge
- [ ] 404 / 500 error pages branded (not Next.js default)
- [ ] Rate limiting on `/api/email/send` and `/api/philly` (prevent abuse)

---

## A/B Testing Plan

Variants (single variable: hero headline):
- **Control** — "One service to handle your rental license" (solution framing)
- **V1** — "Get your rental license in 3–5 days" (speed framing)
- **V2** — "Don't risk $2,000/day in unlicensed-rental fines" (fear framing)

Middleware randomly assigns 33/33/33 on first visit, sticky via 30-day cookie. Manual override: `?v=control|v1|v2`.

- [ ] Drive paid traffic (Google Ads, Meta) to landing
- [ ] Compare per-variant rates: `address_tool_lookup`, `address_tool_checkout_click`, `checkout_complete`
- [ ] Minimum 100+ checkout-starts per variant before declaring winner
- [ ] Document winning variant in CHANGELOG.md

---

## Post-Launch

- [ ] Monitor PostHog daily for first 2 weeks
- [ ] Slack alerts for payment + onboarding events (code already fires these)
- [ ] Weekly pipeline review: leads → paid → onboarded → licensed

---

## Future / v3 Ideas (after 6-8 weeks of traffic data)

- [ ] Philly Rental License Expert chatbot — RAG over L&I rules + HubKey SOPs + FAQ, grounded in address-specific `/api/philly` calls. Defer until session recordings reveal what users actually ask.
- [ ] Real-time status portal — #1 client ask. Surface as a landing feature once built admin-side.
- [ ] PHTIN self-service wizard — scaffold at `/apply/rental-license/phtin-setup`, copy stubbed.
- [ ] Abandoned-cart + PHTIN follow-up cron scheduler (templates exist, need Vercel Cron or Supabase Edge Function).
- [ ] Chat / phone number on landing (late-funnel conversion)

---

## Related files

- `../../CLAUDE.md` — full HubKey project spec + canonical pricing tables
- `../../CHANGELOG.md` — version history including Landing V2 batches
- `../../TODO.md` — HubKey-wide tracking (admin portal, Airbnb portfolio, Buildium sync — everything outside landing scope)
- Philly Lead Inspectors partner reference lives in `~/.claude/projects/.../memory/`

## How this folder is organized

All landing V2 docs live in `docs/landing-v2/`. Add new sibling files here as we generate them:
- Copy drafts (final headline variants, FAQ expansion, email drafts)
- A/B test results (post-launch findings)
- Meeting notes with HubKey team
- Design references (screenshots, inspiration boards)

The landing's **code** stays in its Next.js locations (`src/components/landing/`, `src/app/(public)/apply/rental-license/`, `src/middleware.ts`, etc.) — this folder holds human-readable tracking and context only.
