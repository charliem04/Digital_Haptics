import type { Metadata } from "next";
import { site } from "@/site.config";
import { flags } from "@/lib/flags";
import { isIndexable } from "@/lib/routes";
import { robotsFor } from "@/lib/meta";
import { schedulerName } from "@/lib/booking";
import { LegalPage } from "../legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Digital Haptics handles information submitted through digitalhaptics.dev.",
  // From the route registry, the same flag that keeps it out of the
  // sitemap, so the tag and the sitemap can't drift apart.
  robots: robotsFor(isIndexable("/privacy/")),
};

/*
 * ════════════════════════════════════════════════════════════════════
 *  PRIVACY POLICY. DRAFT (Phase 5): describes only what this site
 *  actually does, per build:
 *    · intake form → Worker → D1; lead email via Resend
 *    · Turnstile (Cloudflare) on forms
 *    · conversion counts into Workers Analytics Engine (no identifiers)
 *    · Cal.com only once an event URL is set (click to load)
 *    · 🚩 FEATURE_AUTOMATIONS only: SMS and the lead webhook
 *  If something is added or switched on, add it here.
 *
 *  Placeholders: retention period (QUESTIONS.md §7). Not legal advice:
 *  an attorney reviews before launch (QUESTIONS.md §20).
 * ════════════════════════════════════════════════════════════════════
 */
const calUrl: string = site.booking.calUrl;
const contactEmail: string = site.email;

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy/" updated="2026-11-04">
      <p>
        This policy explains what information {site.name} ({site.legalName}) collects through{" "}
        {site.url.replace("https://", "")}, why, and what happens to it. The short version: we
        collect what you choose to send us so we can reply, we don&rsquo;t sell it, and we
        don&rsquo;t use advertising trackers.
      </p>

      <h2>What we collect</h2>
      <p>
        <strong>When you send the project form:</strong> your name, business name, trade, phone
        number, email address, website (if you give one), the services you&rsquo;re interested in,
        your timeline, a budget range (if you choose one), and your message.
      </p>
      <p>
        <strong>When you visit the site:</strong> anonymous counts of actions such as a button click
        or a form being started or sent, with the page they happened on. These carry no name, no IP
        address and no identifier, and no cookies are used for them.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To read your inquiry, contact you about it, and prepare a quote.</li>
        <li>To see, in aggregate, which pages lead people to get in touch.</li>
        <li>To keep the forms free of spam and abuse.</li>
      </ul>
      <p>We don&rsquo;t sell your information, and we don&rsquo;t use it for advertising.</p>

      <h2>Who processes it for us</h2>
      <ul>
        <li>
          <strong>Cloudflare</strong> hosts the site, stores form submissions in its database, runs
          the Turnstile spam check (which sees your IP address and browser signals to tell people
          from bots), and holds the anonymous action counts.
        </li>
        <li>
          <strong>Resend</strong> delivers the email that notifies us of your inquiry.
        </li>
        {calUrl && (
          <li>
            <strong>{schedulerName()}</strong> runs the booking calendar, which loads only if you
            choose to open it. What you enter there is handled under {schedulerName()}&rsquo;s own
            privacy policy.
          </li>
        )}
        {flags.automations && (
          <li>
            <strong>Our lead-response system</strong> receives your inquiry to send the text message
            you agreed to and to alert us.
          </li>
        )}
      </ul>

      {flags.automations && (
        <>
          <h2>Text messages</h2>
          <p>
            If you tick the box agreeing to text messages, we send texts about your inquiry to the
            number you gave. Message and data rates may apply. Reply STOP to stop, or HELP for help.
            We don&rsquo;t send marketing texts, and agreeing isn&rsquo;t required to get a quote.
          </p>
        </>
      )}

      <h2>How long we keep it</h2>
      <p>
        We keep form submissions for [PLACEHOLDER: retention period, e.g. 24 months] after we last
        hear from you, then delete them. Anonymous action counts don&rsquo;t identify anyone and are
        kept in aggregate.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us what we hold about you, to correct it, or to delete it, by emailing{" "}
        {contactEmail && !contactEmail.includes("[PLACEHOLDER") ? (
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        ) : (
          "us"
        )}
        . We&rsquo;ll answer within a reasonable time.
      </p>

      <h2>Children</h2>
      <p>This site is for businesses and isn&rsquo;t directed at children under 13.</p>

      <h2>Changes</h2>
      <p>
        If we change how we handle information, we&rsquo;ll update this page and the date at the
        top.
      </p>
    </LegalPage>
  );
}
