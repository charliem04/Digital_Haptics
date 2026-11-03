# Setup you do yourself

Two jobs from Phase 0: connect the repo to Cloudflare Pages, and fill the placeholders in `CONTENT_TODO.md`. Neither blocks Phase 1.

---

## 1. Cloudflare Pages project

**What it gives you:** every push builds the site automatically. Pushes to `main` become the production site. Every other branch (like `refactor/phase-0`) gets its own preview URL, so you can review each phase in a real browser before merging.

**Before you start:** the branch has to be on GitHub. `refactor/phase-0` exists only on your machine right now. Push it yourself, or ask me to (`git push -u origin refactor/phase-0`).

### Step 1: create the project

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Choose **GitHub** and authorize Cloudflare. When GitHub asks which repositories to allow, pick only `charliem04/Digital_Haptics`.
3. Select the repo → **Begin setup**.

### Step 2: build settings

| Field | Value | Why |
|---|---|---|
| Project name | `digitalhaptics` | Becomes `digitalhaptics.pages.dev`. If it's taken, pick another and tell me, so the `deploy` scripts in `site/package.json` can match. |
| Production branch | `main` | Merging a phase into `main` is what publishes it. |
| Framework preset | **None** | The Next.js preset assumes a server runtime. This site is a static export with its own build steps. |
| Build command | `npm run build` | Runs `next build` plus the CSP, SEO, dead-link and secret checks. Any failure stops the deploy. |
| Build output directory | `out` | Where the static export lands (relative to the root directory below). |
| Root directory (advanced) → Path | `site` | The Next.js app lives in `site/`; the repo root also holds docs and the Worker. |

### Step 3: environment variables

You can add these on the setup screen under **Environment variables (optional)**, which applies them to Production. After the first deploy, add or change them under **Settings → Variables and Secrets**. That page sets Production and Preview separately: switch between them with its environment selector.

| Variable | Production | Preview | Why |
|---|---|---|---|
| `FEATURE_AUTOMATIONS` | `false` | `false` | Hides the Automations page, copy and webhook (PLAN §2.1). |
| `FEATURE_AUTOMATIONS_DEMO` | `false` | `false` | Hides the SMS demo. |
| `FEATURE_VOICE` | `false` | `false` | Hides the AI voice section. |
| `NEXT_PUBLIC_PREVIEW` | *(don't add it)* | `1` | Preview builds become noindex, with robots.txt blocking crawlers and an empty sitemap, so preview URLs never show up in Google. |
| `NODE_VERSION` | `20` | `20` | Matches `site/.nvmrc` and CI. Pages should read `.nvmrc` from the root directory anyway; this pins it either way. |

Notes:
- **The flags are off even if you don't set them** (anything other than exactly `true` counts as off). Setting them to `false` makes the state visible in the dashboard and gives Phase 7 something to flip.
- **These are plain text variables.** Don't tick **Encrypt**: none of them are secrets. Phase 4 adds the real secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, and so on), and those do get **Encrypt**.
- **Changes apply on the next build.** After editing a variable, open **Deployments** and use **Retry deployment** on the latest one (or push a commit).

### Step 4: save, deploy, check

1. **Save and Deploy.** The first build runs from `main`, which still holds the old template until Phase 0 is merged. That's expected and harmless, because no custom domain is attached yet.
2. Once `refactor/phase-0` is pushed, its preview URL appears under **Deployments** (something like `refactor-phase-0.digitalhaptics.pages.dev`). Open it and check:
   - The home page shows "Websites that book the job." in the new fonts on the dotted ice background.
   - `/robots.txt` says `Disallow: /`, which proves `NEXT_PUBLIC_PREVIEW` reached the build.
   - `/services/automations/` returns the 404 page.
3. **Leave the custom domain for now.** Attaching `digitalhaptics.dev` is a Phase 6 launch task (`docs/CUTOVER.md` gets rewritten for it).

---

## 2. Placeholders (`CONTENT_TODO.md`)

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
