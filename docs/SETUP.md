# Setup you do yourself

Connect the repo to Cloudflare (§1), fill the placeholders (§2), and switch on the intake form's email and spam check (§3, from Phase 4).

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
| Non-production branch deploy command | `npx wrangler preview` (the dashboard default) | Each branch gets its own preview URL, named after the branch, and never replaces production. Needs the `previews` block in `site/wrangler.jsonc`, which is already there. Make sure builds for non-production branches are **enabled**. |
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

---

## 3. Intake form: database, email, spam check (Phase 4)

The form works the moment Phase 4 deploys: every submission is stored in the database. Until the steps below are done, two things wait:

- **No email.** Nobody is emailed about the lead. It's stored with `email_status = disabled` and sent automatically once email is set up, by the retry that runs every 15 minutes.
- **No spam check.** Turnstile is skipped, and the row says `turnstile = unconfigured`.

Do all of this before launch (Phase 6).

### Step 1: the database (done)

Two D1 databases, both pinned by ID in `site/wrangler.jsonc`:

| Database | ID | Used by |
|---|---|---|
| `digitalhaptics-leads` | `dc861fa5-c152-4904-9193-18e536d1771f` | Production (`main`). Created automatically by the first `wrangler deploy`. |
| `digitalhaptics-leads-preview` | `68201293-423c-4c82-91ab-0eab9f888156` | Every branch preview. Created in the dashboard, because `wrangler preview` won't create one. |

The Worker creates its table on the first submission, so there is no migration step. If a preview build ever fails with `binding DB of type d1 must have a database_id specified`, that preview ID is missing.

**Reading leads:** D1 → `digitalhaptics-leads` → **Console**, then:

```sql
SELECT received_at, name, business, phone, email, email_status FROM leads ORDER BY received_at DESC LIMIT 50;
```

### Step 2: Turnstile (spam check)

1. Dashboard → **Turnstile** → **Add widget**. Name it `digitalhaptics`. Under hostnames, add `digitalhaptics.dev` and `charliem04work.workers.dev` (the second covers the workers.dev and preview URLs). Mode: **Managed**.
2. Copy the **site key** (public) and the **secret key**.
3. Worker → **Settings → Build → Variables and secrets**: add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the site key, as a plain variable. It's a build variable because the page needs it.
4. Worker → **Settings → Variables and Secrets** (the runtime ones, not Build): add `TURNSTILE_SECRET_KEY` = the secret key, type **Secret**.
5. Retry the latest build. The form now shows the check, and the Worker refuses submissions without a valid token.
   - **The usual mix-up:** the site key is a *build* variable, but the secret is a *runtime* secret. If the Turnstile dashboard says "Siteverify isn't being called", the Worker can't see `TURNSTILE_SECRET_KEY`. It's probably under Build variables; move it to **Settings → Variables and Secrets**.
   - **What the Worker checks:** a token passes only if Cloudflare confirms it, it was solved on the same form (`action`: `intake` or `demo`), and it was issued on the same hostname as the request. Each token works once; the form gets a fresh one after any failed send.

### Step 3: email (Resend)

Lead emails go to `LEAD_NOTIFY_TO` (`charles@digitalhaptics.dev`) from `LEAD_NOTIFY_FROM` (`leads@digitalhaptics.dev`). Both are in `site/wrangler.jsonc`; tell me if you want them changed.

1. Create a free account at resend.com. Under **Domains**, add `digitalhaptics.dev` and add the DNS records it shows (SPF/DKIM) wherever the domain's DNS lives. Wait for **Verified**.
2. **API Keys → Create**: permission **Sending access**, domain `digitalhaptics.dev`. Copy it; it's shown once.
3. Worker → **Settings → Variables and Secrets**: add `RESEND_API_KEY`, type **Secret**.
4. `charles@digitalhaptics.dev` has to receive mail: set up the mailbox or Cloudflare Email Routing first (CONTENT_TODO.md).
5. **Check:** send a test through the form on the live site. The email arrives with the lead as Reply-To. Leads that came in before this step go out within 15 minutes.

### Step 4 (optional, Phase 7): automations webhook 🚩

Only when `FEATURE_AUTOMATIONS` is turned on. Add `AUTOMATIONS_WEBHOOK_URL` (and optionally `AUTOMATIONS_WEBHOOK_SECRET`, sent as the `X-Webhook-Secret` header) as runtime **Secrets**. With the flag off, nothing is ever forwarded, whatever is set.

### Analytics

Conversion events (`cta_click`, `form_start`, `form_submit`, `call_click`, `booking_complete`) go into the Analytics Engine dataset `digitalhaptics_events`, which is created on first write. Query them under **Workers → Analytics Engine**, or ask me for a saved query. Pageviews come from Cloudflare Web Analytics (Phase 6).

### Testing locally

Run `npm run build`, then `npm run worker:dev` in `site/`. It serves the built site plus the Worker on a local database. To exercise Turnstile, create `site/.dev.vars` (git-ignored) with Cloudflare's published test secret `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`, and build with `NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`. Never put real keys in that file.

