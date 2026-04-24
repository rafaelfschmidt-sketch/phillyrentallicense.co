# Changelog

## [0.1.0] - 2026-04-24

### Initial import from hubkeyhub

This repo was created from the Landing V2 work originally developed in `HubKey76/HubKey-Hub` on branch `feature/landing-v2-engagement`. Splitting out into its own repo unblocks independent deployment (separate Vercel project under Blue Homes, no dependency on HubKey Vercel access) while keeping the Supabase backend shared so submissions still flow to HubKey's admin pipeline.

### What was imported

**Landing UI**
- Hero with variant-aware headlines (3 variants: solution / speed / fear framing)
- Consolidated AddressTool (compliance preview + pricing calculator, one address input)
- Philly OPA address autocomplete
- FAQ with 12 questions including $2k/day penalty and license non-transferability
- Testimonial carousel with 3 named quotes
- Value stack showing $1,200 in à-la-carte equivalent for the $500 flat fee
- Problem section, complexity cards, how-it-works, pricing, final CTA

**A/B infrastructure**
- Middleware-based variant assignment (33/33/33 random on first visit, sticky 30-day cookie)
- PostHog + Vercel Analytics wired; all events tagged with `lp_variant` + `lp_domain`
- Server-side `landing_view_server` event + client-side `address_tool_lookup`, `address_tool_checkout_click`, `address_tool_email_capture`, `checkout_complete`

**Checkout**
- Intake form with OPA-powered address autocomplete
- Stripe Checkout Session creation via `/api/stripe/checkout`
- Stripe webhook handler at `/api/stripe/webhook` — updates Supabase, logs note, creates Google Drive folder, posts to Slack, sends Resend payment-confirmation email, captures PostHog event
- Onboarding form with PHTIN / lead paint / access fields, triggers second Slack + confirmation email

**Email pipeline (Resend)**
- New templates: `sendPaymentConfirmation`, `sendOnboardingComplete`, `sendAbandonedCartRecovery`
- Existing templates preserved: `sendRentalLicenseFormRequest`, `sendPHTINReminder`, `sendStatusUpdate`, `sendRLSIRequest`, `sendLicenseComplete`

**Philly API resilience**
- `fetchWithRetry` helper retries CARTO/ArcGIS once on 5xx
- Structured error codes (`MISSING_ADDRESS`, `UPSTREAM_UNAVAILABLE`, `INTERNAL_ERROR`) so frontend can distinguish upstream outages from address-not-found
- Client-side address normalization (uppercase, strip commas/zip)

### Added in this repo (not in hubkeyhub)

- `/admin/progress` — password-protected dashboard showing 7-day leads, paid applications, revenue, A/B variant split, lead source breakdown, application pipeline, and the 20 most recent leads + applications. Gated by `ADMIN_PASSWORD` env var.
- Middleware simplified to one domain (no more APPLY_HOST vs PRL_HOST branching — this repo only serves phillyrentallicenses.co)

### Preserved in `legacy/`

- `legacy/DESIGN.md` — original design exploration doc
- `legacy/index.html` — Stitch-export static landing prototype from 2026-04-09
- `legacy/screen.png` — design mockup screenshot

Kept for reference; not wired into the build.

### Not imported (stayed in hubkeyhub)

All admin routes and integrations: `/admin/rental-license-only`, `/compliance`, `/portfolio`, `/workflows`, `/clients`, `/rentals`, Buildium sync, Documenso, LeadSimple importer, SOP task engine. The hubkeyhub repo continues to serve the HubKey admin at `hubkey-hub.vercel.app`.
