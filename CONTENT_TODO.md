# Content TODO

Every `[PLACEHOLDER]` (and PLAN's own bracketed placeholders like `[PRICE]`) in the codebase is listed here. Nothing ships to Production with an entry still open: fill it, or hide the section it belongs to (PLAN §9, Phase 6).

Never replace a placeholder with an invented price, stat, client result, testimonial or client name.

What each item needs, with examples: [docs/SETUP.md §2](docs/SETUP.md).

| Placeholder | Where | Needed from | Status |
|---|---|---|---|
| Legal entity name | `site/site.config.ts` → `legalName` | You | Done 2026-11-03: `Charles Meyers` (sole proprietor). **Change to `Digital Haptics LLC` once the LLC is filed.** |
| Agency phone | `site/site.config.ts` → `phone` | You | Done 2026-11-03: (337) 412-5714 |
| Agency email | `site/site.config.ts` → `email` | You | Done 2026-11-03: `charles@digitalhaptics.dev`. **Before launch:** set up a mailbox or Cloudflare Email Routing for it, or mail to it bounces. |
| Cal.com event URL (`booking.calUrl`, currently empty) | `site/site.config.ts` | You | Deferred: no Cal.com account yet. /start/ shows only the intake form until set. |
| Response time | `site/site.config.ts` → `intake.responseTime` (thank-you page) | You | Done 2026-11-03: one business day |
| Social URLs (all empty, so hidden) | `site/site.config.ts` → `socials` | You | Deferred: no accounts yet. Add each when created. |
| Service-area city list | `site/site.config.ts` → `serviceArea` | You | Done 2026-11-03: all seven confirmed, plus remote work nationwide (structured data only). |
| `[PLACEHOLDER: privacy policy, written in Phase 5]` | `site/app/privacy/page.tsx` | Phase 5 draft, then attorney review | Open |
| `[PLACEHOLDER: terms of service, written in Phase 5]` | `site/app/terms/page.tsx` | Phase 5 draft, then attorney review | Open |

## Phase 1 (design system)

| Item | Where | Needed from | Status |
|---|---|---|---|
| Hero sidebar blurbs, taken verbatim from the Hybrid mockup: "Sites that look like the work you do: solid, square, built right." / "Found first when someone nearby searches for your trade." / 🚩 "Every form and missed call gets a reply in seconds." | `site/data/acts.ts` | You: approve or rewrite | Open |
| Styleguide sample values `[Client name]`, `[RESULT]`, `[Timeline options]` | `site/app/styleguide/page.tsx` | Nobody: they're demo placeholders on a hidden page and stay bracketed | n/a |

## Phase 3 (core pages)

| Item | Where | Needed from | Status |
|---|---|---|---|
| `[PRICE]` ×2 (×3 with 🚩): "Websites from [PRICE]", "Local SEO from [PRICE]/mo", 🚩 "Automations from [PRICE]/mo" | `site/data/services.ts` → `price` | You | Open |
| Budget ranges for the intake form (the field stays hidden until set) | `site/data/intake.ts` → `budgets` | You | Open |
| Timeline options: defaults in place, `// OPEN:` | `site/data/intake.ts` → `timelines` | You: confirm or edit | Open |
| Case studies, all five drafts: `location`, `systems`, `summary`, `results` (`[RESULT]`), body sections, screenshots, `liveUrl`. **Then client permission** (`permission: true`) and `published: true`. Until permission, drafts render on previews as `/work/draft-N/` with no name, live link or screenshot: **keep the client name out of the body text until then too.** | `site/content/work/*.mdx` | You and each client | Open |
| DRAFT copy to review: service leads, "What you get", "A good fit if", service FAQs | `site/data/services.ts` | You | Open |
| DRAFT copy to review: process steps, /start steps, /start FAQ, thank-you next steps | `site/data/process.ts`, `site/data/faq.ts`, `site/app/start/thanks/page.tsx` | You | Open |
| DRAFT copy to review: home service-area lede ("…when the AC quits in August"), CTA band headings | `site/app/page.tsx` and each page's `CtaBand` | You | Open |
| 🚩 SMS consent wording: check against your SMS provider's and carrier rules before Phase 7 | `site/data/intake.ts` → `smsConsent` | You (and provider) | Open |
| 🚩 Live systems teaser copy (home, flag on) | `site/app/page.tsx` | You | Open |

## Phase 4 (systems)

| Item | Where | Needed from | Status |
|---|---|---|---|
| Turnstile widget + keys, Resend domain + API key: the form stores leads without them but sends no email and skips the spam check | Cloudflare / Resend dashboards ([docs/SETUP.md §3](docs/SETUP.md)) | You | Open |
| Confirm lead email addresses (`LEAD_NOTIFY_TO` charles@, `LEAD_NOTIFY_FROM` leads@digitalhaptics.dev) | `site/wrangler.jsonc` → `vars` | You | Open |
| Reply as charles@digitalhaptics.dev: Gmail "Send mail as" via Resend SMTP (Option A, chosen 2026-11-04) | Resend + Gmail ([docs/SETUP.md §3 Step 3b](docs/SETUP.md)) | You | Open |
| **Phase 6, before launch:** DMARC TXT record `_dmarc` → `v=DMARC1; p=none; rua=mailto:charles@digitalhaptics.dev` | Cloudflare DNS ([docs/SETUP.md §3 Step 5](docs/SETUP.md)) | You | Open |
| 🚩 Automations page DRAFT copy: problem, modules, add-on | `site/data/automations.ts` | You | Open |
| 🚩 Demo copy and message sequence (Demo Plumbing Co., fictional) | `site/data/automations.ts`, `site/data/demo.ts` | You | Open |
| 🚩 `[PLACEHOLDER: voice demo number]` (FEATURE_VOICE section) | `site/data/automations.ts` → `voiceCopy.number` | You, when the voice agent ships | Open |
| Cal.com `bookingSuccessful` event name: confirm with a real booking once the event URL is set (`// OPEN:`) | `site/components/BookingEmbed.tsx` | Me, after Cal.com is set up | Open |

## Coming in later phases (from PLAN.md, logged when the code lands)

- Unique content for each city page (cities without it stay unpublished)
- About page: founder name and background details
