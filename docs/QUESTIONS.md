# Questions for Charles

What the site still needs from you. Answer in chat or here, a few at a time. Rough notes are fine. `CONTENT_TODO.md` tracks where each answer lands in the code.

Legend: 🔴 needed before launch · 🟡 makes the site better · 🚩 only once automations are switched on (Phase 7).

---

## Still open

**A. 🔴 Case study write-ups (CTL Pro Construction, Coastal Construction Services, DA Plumbing).** All three have your OK and their towns. Each needs the following before it can publish, in `site/content/work/<client>.mdx`:
- one sentence on what the project was
- what wasn't working before
- what you built
- which systems run now (site, SEO, …)
- the live site link, if it's public
- any results you can back up (with the client's OK)
- desktop and mobile screenshots

Until then they show on preview links only. The Work page, the home proof strip and "See the Work" appear in production as soon as the first one publishes.

> **Also: you wrote "CTL Demo".** Is the CTL project a demo or concept site rather than a live client site? If so, the card should say "Demo" instead of "Live site". Tell me which.
>
> **Answer:**

**B. 🔴 DMARC record.** One DNS line. Step by step in `docs/SETUP.md` §3 Step 5 (and in chat). Tell me once it's added.

> **Answer:**

**C. 🟡 Cal.com test booking.** The calendar is live on `/start/`. Make one test booking on a preview link so the "booking complete" tracking can be confirmed, then cancel it. Also check the event description: it currently talks about "demo sites" for "potential clients", which reads as written for a different audience than a trades owner booking a call.

> **Answer:**

**D. 🟡 Social profiles.** Google Business Profile is linked. Send me Facebook, Instagram and LinkedIn links as each one goes up.

> **Answer:**

**E. 🟡 Your photo** for the About page. Drop it in `site/public/about/` or send it.

> **Answer:**

**F. 🟡 City pages.** Each town only publishes with content that's specific to it (PLAN §5). The case study towns are a start: Broussard/Lafayette (CTL), New Iberia (Coastal), Scott (DA Plumbing). Once those write-ups exist, I can build those cities' pages around the real local work. Anything else you know about a specific town helps too.

> **Answer:**

**G. 🟡 LLC.** When Digital Haptics LLC is filed, tell me and the legal name updates everywhere.

> **Answer:**

**H. 🚩 Later (Phase 7):** SMS consent wording, the voice demo number, and the Automations page copy.

---

## Answered (2026-11-17)

| # | Question | Answer, and where it went |
|---|---|---|
| 1–2 | Your story, how you work | Written into the About page (`site/data/about.ts`), in your voice. Automations aren't mentioned while that flag is off. |
| 3 | Name and title | Charles Meyers, Founder |
| 4 | Photo | Coming later (open item E) |
| 5 | Local ties | Based in Lafayette, Acadiana all your life, UL Lafayette senior |
| 6 | Cities / reach | Remote work, all of Louisiana and beyond. Added to the About page, home service-area section, FAQ and structured data. City pages stay unpublished until each has local content (open item F). |
| 7 | Lead retention | 12 months (privacy policy) |
| 8 | Law / venue | Louisiana, Lafayette Parish (terms) |
| 9 | Separate client contracts | Yes; the terms cover the website only |
| 10 | Prices | Websites from $1,000 · Local SEO from $100/mo · 🚩 Automations from $500/mo |
| 11 | Budget ranges | Under $1k / $1k–$2k / $2k–$5k / $5k–$10k / $10k+ (field now shown on the form) |
| 12 | Timelines | As soon as possible / Within 2 weeks / In the next 1–3 months / Later this year / Just exploring |
| 13 | Case studies to show | CTL Pro Construction, Coastal Construction Services, DA Plumbing (permission recorded; Douet A/C and Stan's stay hidden) |
| 14 | Their towns | CTL: Broussard/Lafayette · Coastal: New Iberia · DA Plumbing: Scott (rest is open item A) |
| 15 | Draft copy | Approved for now; updated as new info comes in |
| 20 | Attorney review | Skipped, by your call. The "pending review" notice is removed from the legal pages. |
| C | Cal.com event link | `cal.com/charlie-meyers-xhr6cy/intro-call`, embedded on `/start/` (`site/site.config.ts`) |
| D | Google Business Profile | `share.google/aXNQILMwa9oqYbJYt`, in the footer icons and structured data (`site/site.config.ts`) |
