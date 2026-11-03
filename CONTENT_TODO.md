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

## Coming in later phases (from PLAN.md, logged when the code lands)

- `[PRICE]` ×2 on /pricing (Websites, Local SEO); a third for Automations behind 🚩 `FEATURE_AUTOMATIONS`
- `[RESULT]` on every case study, plus client permission for each candidate (CTL Pro Construction, Douet A/C, DA Plumbing, Coastal Construction Services, Stan's Tire and Automotive)
- Intake form: timeline options and budget ranges
- Unique content for each city page (cities without it stay unpublished)
- About page: founder name and background details
