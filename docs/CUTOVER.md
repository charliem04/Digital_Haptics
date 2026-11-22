# Launch runbook: digitalhaptics.dev

The production Worker already serves `https://digitalhaptics.dev`, and search engines are allowed to index it. There is no old site to migrate, so launch means closing the items below.

## Status (checked 2026-11-22)

| Check | Status |
|---|---|
| Domain serves the production build over HTTPS | Done |
| Security headers, including HSTS and CSP | Done |
| Flagged routes return 404, automation flags off | Done |
| Sitemap (7 pages) and robots.txt | Done |
| Email DNS: Cloudflare MX, SPF, Resend DKIM, DMARC | Done |
| Build blocks leftover placeholders | Done |
| Accessibility and layout audit | Done, with the site's own browser checks |
| `www.digitalhaptics.dev` | **Not set up: does not resolve** |
| Real form submission on `digitalhaptics.dev` | **To do** |
| Real Cal.com booking | **To do** |
| Lighthouse / PageSpeed score | **To do** |
| Search Console | **To do** |

## Before you announce the site

### 1. Set up www

1. Cloudflare → `digitalhaptics.dev` → **DNS** → **Add record**: type `AAAA`, name `www`, IPv6 `100::`, Proxied on.
2. **Rules** → **Create rule** → **Redirect Rule** → use the template **Redirect from WWW to root**. It should be a 301 that keeps the path and query string.
3. Check that `https://www.digitalhaptics.dev/pricing/` lands on `https://digitalhaptics.dev/pricing/`.

### 2. Confirm HTTPS is forced

Cloudflare → **SSL/TLS** → **Edge Certificates** → **Always Use HTTPS** on. Leave Cloudflare's own HSTS setting off, because the site already sends the header.

### 3. Test the form on the real domain

1. Confirm the Turnstile widget's hostnames include `digitalhaptics.dev`.
2. Submit `/start/` from your phone with the business name `TEST LEAD - delete me`.
3. Confirm you land on the thank-you page and the lead email arrives.

### 4. Test booking

Book a call through `/start/`, confirm the calendar invite arrives, then cancel it. Tell me when it's done so I can check the booking event and close the `// OPEN:` note in `BookingEmbed.tsx`.

### 5. Test email both ways

Send a message to `charles@digitalhaptics.dev` from another account, then reply from Gmail as that address. Confirm the reply arrives and isn't in spam.

### 6. Tap every contact link

From a phone: the call button, the email link and the Google icon in the footer.

### 7. Delete test leads

Run this on both `digitalhaptics-leads` and `digitalhaptics-leads-preview` in Cloudflare → **D1** → **Console**. It permanently deletes only rows with that test name.

```sql
DELETE FROM leads WHERE business = 'TEST LEAD - delete me';
```

## Launch day

1. **Search Console:** add a **Domain** property for `digitalhaptics.dev`, verify it with the DNS record, and submit `https://digitalhaptics.dev/sitemap.xml`.
2. **Google Business Profile:** set the website to `https://digitalhaptics.dev`. Make sure the name and phone match the site exactly.
3. **PageSpeed Insights:** run the home page and `/start/` on mobile at <https://pagespeed.web.dev>. The target is 90 or higher.
4. **Rich Results Test:** run the home page and a service page at <https://search.google.com/test/rich-results>.
5. **Cloudflare Web Analytics:** turn it on for the domain if it isn't on yet.

## One week after

- Check Search Console for crawl errors and pages not indexed.
- Check the Worker's logs for failed lead emails.
- Check your DMARC reports for mail failing SPF or DKIM. Tighten the policy only after the reports are clean.

## If something breaks

Cloudflare → Worker → **Deployments** → pick the last good version → **Rollback**. This restores the site in seconds and does not touch the lead database.

## Can follow after launch

Case studies, your photo, city pages, other social profiles, and the LLC name. Each one appears on the site when its content is added. Automations stay off until Phase 7.
