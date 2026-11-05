# Questions for Charles

Everything the site still needs from you, as questions. Answer in this file (type under each **Answer:**) or in chat, in any order, a few at a time. Rough notes are fine: I turn them into copy and send it back for your approval.

Until an item is answered, the site shows a clearly marked `[PLACEHOLDER]`, or keeps that section hidden. Nothing invented goes live. `CONTENT_TODO.md` tracks where each answer lands in the code.

Legend: 🔴 needed before launch · 🟡 makes the site better · 🚩 only matters once automations are switched on (Phase 7).

---

## About you (About page)

**1. 🔴 Your story, in your own words.** PLAN.md says you worked construction alongside your family, so you understand the trades. How did that lead to building websites? A few sentences, or bullet points.

> **Answer:**

**2. 🔴 What should a trades owner know about working with you?** For example: you pick up the phone, you explain things without jargon, you've been on job sites. What do you do differently from a typical web agency?

> **Answer:**

**3. 🟡 How do you want to be named on the page?** "Charles Meyers", "Charles", or something else. Should a job title appear, e.g. "Founder"?

> **Answer:**

**4. 🟡 A photo of you.** Optional, but it helps local owners trust a one-person business. A clear, well-lit shot, ideally not a selfie. Drop it in `site/public/about/` or send it to me.

> **Answer:**

**5. 🟡 Anything local worth saying?** Where you're based (town only is fine), how long you've been in Acadiana, community ties.

> **Answer:**

---

## City pages (`/areas/<city>/`)

A city page only goes live once it has content that's genuinely about that city (PLAN.md §5). Copies with the town name swapped are thin content and hurt rankings. Each page needs two or three of the items below. Skip any city you have nothing for; it stays unpublished.

**6. 🟡 For each town (Lafayette, Broussard, Youngsville, Scott, Carencro, New Iberia, Breaux Bridge):**
- Clients or projects there (even unnamed: "a roofer in Broussard")
- What's different about the trades market there (growth, storm season, new construction, older homes)
- Which trades you most want to reach there
- Anything you know firsthand about the town

> **Lafayette:**
>
> **Broussard:**
>
> **Youngsville:**
>
> **Scott:**
>
> **Carencro:**
>
> **New Iberia:**
>
> **Breaux Bridge:**

---

## Privacy policy and terms

I draft both from what the site actually does. Before launch, they should be read by an attorney.

**7. 🔴 How long should leads be kept?** The database holds each inquiry: name, business, phone, email and message. Options: 12 months, 24 months, or until you delete them. Shorter is better for privacy; long enough to follow up is better for business.

> **Answer:**

**8. 🔴 Which state's law, and where are disputes handled?** The default is Louisiana and your parish. Which parish?

> **Answer:**

**9. 🟡 Do you sign client contracts separately?** If yes, the site's terms only cover using the website, not client projects. That's my assumption.

> **Answer:**

---

## Prices and the intake form

**10. 🔴 Starting prices.** "Websites from $___" and "Local SEO from $___/mo". 🚩 later: "Automations from $___/mo".

> **Answer:**

**11. 🟡 Budget ranges for the form** (optional field, hidden until set). For example: Under $2k / $2k–5k / $5k–10k / $10k+.

> **Answer:**

**12. 🟡 Timeline options.** The current defaults are "As soon as possible / In the next 1–3 months / Later this year / Just exploring". Keep or change?

> **Answer:**

---

## Case studies (Work)

**13. 🔴 Which clients have said yes to being shown?** Candidates from PLAN.md: CTL Pro Construction, Douet A/C, DA Plumbing, Coastal Construction Services, Stan's Tire and Automotive. Each one needs their OK first.

> **Answer:**

**14. 🔴 For each client who said yes:** their town, what wasn't working before, what you built, which systems run now (site / SEO / …), a live link, any results you can back up (calls, leads, rankings, with the client's OK), and desktop and mobile screenshots.

> **Answer:**

---

## Copy review

**15. 🟡 Read and approve or edit the draft copy.** It describes the work and makes no claims or numbers. It's in:
- `site/data/services.ts` (service pages)
- `site/data/process.ts` (process steps)
- `site/data/faq.ts` (FAQ)
- `site/data/acts.ts` (hero sidebar lines, from the mockup)
- the About page, once written from your answers above

> **Answer:**

---

## Accounts and links

**16. 🟡 Cal.com.** Once you've created an event (e.g. a 20-minute intro call), send me the link and the calendar appears on /start.

> **Answer:**

**17. 🟡 Social profiles.** Google Business Profile, Facebook, Instagram, LinkedIn: whichever exist. Each one gets a footer link.

> **Answer:**

**18. 🟡 LLC.** When Digital Haptics LLC is filed, tell me and I'll update the legal name everywhere.

> **Answer:**

---

## Launch (Phase 6)

**19. 🔴 DMARC record.** One DNS line: see `docs/SETUP.md` §3 Step 5. Tell me once it's added.

> **Answer:**

**20. 🔴 Attorney review** of the privacy policy and terms, once drafted.

> **Answer:**

---

## 🚩 Automations (Phase 7, later)

**21. SMS consent wording:** check it with your SMS provider (`site/data/intake.ts`).
**22. Voice receptionist demo number**, once the voice agent exists.
**23. Automations page copy review** (`site/data/automations.ts`).
