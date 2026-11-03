# Content TODO

Every `[PLACEHOLDER]` (and PLAN's own bracketed placeholders like `[PRICE]`) in the codebase is listed here. Nothing ships to Production with an entry still open: fill it, or hide the section it belongs to (PLAN §9, Phase 6).

Never replace a placeholder with an invented price, stat, client result, testimonial or client name.

| Placeholder | Where | Needed from | Status |
|---|---|---|---|
| `[PLACEHOLDER: legal entity name]` | `site/site.config.ts` → `legalName` | You | Open |
| `[PLACEHOLDER: agency phone]` + `phone.e164` | `site/site.config.ts` → `phone` | You | Open |
| `[PLACEHOLDER: agency email]` | `site/site.config.ts` → `email` | You | Open |
| Cal.com event URL (`booking.calUrl`, currently empty) | `site/site.config.ts` | You | Open |
| `[RESPONSE TIME]` | `site/site.config.ts` → `intake.responseTime` (thank-you page) | You | Open |
| Social URLs (all empty, so hidden) | `site/site.config.ts` → `socials` | You | Open |
| Service-area city list: confirm the seven in PLAN §3 | `site/site.config.ts` → `serviceArea.cities` | You | Open |
| `[PLACEHOLDER: privacy policy, written in Phase 5]` | `site/app/privacy/page.tsx` | Phase 5 draft, then attorney review | Open |
| `[PLACEHOLDER: terms of service, written in Phase 5]` | `site/app/terms/page.tsx` | Phase 5 draft, then attorney review | Open |

## Coming in later phases (from PLAN.md, logged when the code lands)

- `[PRICE]` ×2 on /pricing (Websites, Local SEO); a third for Automations behind 🚩 `FEATURE_AUTOMATIONS`
- `[RESULT]` on every case study, plus client permission for each candidate (CTL Pro Construction, Douet A/C, DA Plumbing, Coastal Construction Services, Stan's Tire and Automotive)
- Intake form: timeline options and budget ranges
- Unique content for each city page (cities without it stay unpublished)
- About page: founder name and background details
