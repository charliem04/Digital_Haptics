# Setup you do yourself

Two jobs from Phase 0: connect the repo to Cloudflare, and fill the placeholders in `CONTENT_TODO.md`. Neither blocks Phase 1.

---

## 1. Cloudflare Worker

The site runs as one Cloudflare **Worker** named `digitalhaptics`. It serves the static export from `site/out/`, and from Phase 4 it also runs the intake endpoint. Hosting moved from Pages to Workers on 2026-11-03 (`docs/REFACTOR_AUDIT.md` §9). `site/wrangler.jsonc` holds the Worker's config, so the dashboard only needs the build settings below.

**What it gives you:** pushes to `main` deploy the production site. Pushes to any other branch upload a preview version with its own URL, so you can review each phase before merging.

### Step 1: create the Worker

Cloudflare dashboard → **Workers & Pages** → **Create application** → **Workers** tab → **Import a repository** → GitHub → `charliem04/Digital_Haptics`. When GitHub asks which repositories to allow, pick only that one.

### Step 2: build settings

Under the Worker → **Settings** → **Build**:

| Field | Value | Why |
|---|---|---|
| Worker name | `digitalhaptics` | Must match `name` in `site/wrangler.jsonc`. If you pick another, tell me so the file matches. |
| Production branch | `main` | Merging a phase into `main` is what publishes it. |
| Build command | `npm run build` | Runs `next build` plus the CSP, SEO, dead-link and secret checks. Any failure stops the deploy. |
| Deploy command | `npx wrangler deploy` | Uploads `out/` as the Worker's assets, using `site/wrangler.jsonc`. |
| Non-production branch deploy command | `npx wrangler versions upload` | Previews get their own URL and never replace production. Make sure builds for non-production branches are **enabled**. |
| Root directory | `/site` | The Next.js app and `wrangler.jsonc` live in `site/`. |

### Step 3: build variables

Under **Settings** → **Build** → **Variables and secrets**. These are **build** variables, which `npm run build` reads. They are separate from the runtime **Variables and Secrets** under Settings, which Phase 4 uses for the endpoint's secrets.

| Variable | Value | Why |
|---|---|---|
| `FEATURE_AUTOMATIONS` | `false` | Hides the Automations page, copy and webhook (PLAN §2.1). |
| `FEATURE_AUTOMATIONS_DEMO` | `false` | Hides the SMS demo. |
| `FEATURE_VOICE` | `false` | Hides the AI voice section. |
| `NODE_VERSION` | `22` | Matches `site/.nvmrc` and CI. Wrangler (the deploy step) refuses to run on anything older. |

Notes:
- **One set of variables covers every branch.** Workers Builds has no separate Preview list, and nothing here needs one.
- **No preview variable needed.** Any branch other than `main` builds as a preview automatically (the build reads `WORKERS_CI_BRANCH`): every page is noindex, robots.txt blocks crawlers, the sitemap is empty, and an `X-Robots-Tag` header covers everything else. Never set `NEXT_PUBLIC_PREVIEW` here, because it would hide production too.
- **The flags are off even if you don't set them** (anything other than exactly `true` counts as off). Setting them to `false` makes the state visible and gives Phase 7 something to flip.
- **Plain variables, not secrets:** none of these are sensitive. Phase 4's real secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, and so on) go in as secrets.
- **Changes apply on the next build.** Push a commit or retry the latest build.

### Step 4: deploy and check

1. Push or retry a build on `main`. The production site appears at `digitalhaptics.<your-subdomain>.workers.dev` (the Worker's overview page shows the exact URL). Check:
   - The home page shows "Websites that book the job." in the new fonts on the dotted ice background.
   - `/services/automations/` returns the 404 page.
2. Push a branch and open its preview URL (shown on the build, or under **Deployments**). `/robots.txt` should say `Disallow: /`.
3. **Leave the custom domain for now.** Attaching `digitalhaptics.dev` is a Phase 6 launch task (`docs/CUTOVER.md` gets rewritten for it).
4. **Clean-up:** once the Worker builds, delete the old Pages project (`digitalhaptics`) so pushes stop building twice.

---

## 2. Placeholders (`CONTENT_TODO.md`)

> **Status 2026-11-03:** filled except Cal.com and socials (deferred) and the legal pages (Phase 5). `CONTENT_TODO.md` has the current state. Two follow-ups: switch the legal name to `Digital Haptics LLC` once it's filed, and create the `charles@digitalhaptics.dev` mailbox or Email Routing rule before launch.

Nothing here blocks the build. Every placeholder renders visibly or stays hidden until filled, and Phase 6 won't launch with any still open. **Easiest route:** send me the values in chat and I'll put them in `site/site.config.ts` and close the rows. Or edit that file yourself; every value is in one place.

| Item | What to give me | Format / example | What happens until then |
|---|---|---|---|
| **Legal entity name** | The exact registered name: e.g. your LLC as filed with the Louisiana Secretary of State, or your own name if you're a sole proprietor. | `Digital Haptics LLC` | Footer copyright and legal pages show the placeholder; JSON-LD omits it. |
| **Agency phone** | The number prospects should call, both as people read it and in international format. | `(337) 555-0100` and `+13375550100` | No tel: links or phone anywhere. |
| **Agency email** | The inbox for the footer and contact details. A domain address (e.g. `hello@digitalhaptics.dev`) looks more established; Cloudflare Email Routing can forward it to your existing inbox for free. | `hello@digitalhaptics.dev` | Placeholder text; JSON-LD omits it. |
| **Cal.com event URL** | Create an event type in Cal.com (e.g. a 20-minute "Project intro call"), then copy its public link. Also set the brand color to `#FF5A1F` under Cal.com **Settings → Appearance** so the calendar matches the site. | `https://cal.com/<username>/<event>` | /start/ shows only the intake form, no calendar. |
| **Response time** | How quickly you'll reply to an inquiry. It completes the sentence on the thank-you page: "We'll reach out within ___." Pick something you can always keep. | `one business day` | Thank-you page shows `[RESPONSE TIME]`. |
| **Social links** | Any you want linked: Google Business Profile (its share link), Facebook, Instagram, LinkedIn. Skip any you don't use. | Full `https://` URLs | That icon is hidden. Nothing breaks. |
| **City list** | Confirm, add or remove from: Lafayette, Broussard, Youngsville, Scott, Carencro, New Iberia, Breaux Bridge. | A yes, or the edited list | These appear in structured data as areas served. Each city page is published only once it has unique content (Phase 5). |
| **Privacy policy / terms** | Nothing yet. I draft both in Phase 5 from what the site actually does; then an attorney should read them before launch. | n/a | Stub pages, kept out of search. |

**Coming later** (listed at the bottom of `CONTENT_TODO.md`, not needed now): starting prices for /pricing, case-study results and each client's permission, intake-form timeline and budget options, unique city content, and your About-page details.
