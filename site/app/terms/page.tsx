import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/site.config";
import { isIndexable } from "@/lib/routes";
import { robotsFor } from "@/lib/meta";
import { LegalPage } from "../legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using digitalhaptics.dev.",
  robots: robotsFor(isIndexable("/terms/")),
};

/*
 * ════════════════════════════════════════════════════════════════════
 *  TERMS OF SERVICE. DRAFT (Phase 5). Covers using the website only.
 *  Client projects are governed by their own signed agreement, and
 *  nothing here speaks for them (assumption logged as QUESTIONS.md §9).
 *
 *  Placeholders: parish / venue (QUESTIONS.md §8). Not legal advice:
 *  an attorney reviews before launch (QUESTIONS.md §20).
 * ════════════════════════════════════════════════════════════════════
 */
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" path="/terms/" updated="2026-11-04">
      <p>
        These terms cover your use of {site.url.replace("https://", "")}, run by {site.name} (
        {site.legalName}). By using the site, you agree to them.
      </p>

      <h2>What this site is</h2>
      <p>
        Information about our web design and local SEO services, examples of our work, and a form to
        ask us about a project. Sending the form doesn&rsquo;t create a contract or commit either of
        us to anything.
      </p>

      <h2>Prices and quotes</h2>
      <p>
        Prices shown as &ldquo;from&rdquo; or &ldquo;starting at&rdquo; are a guide, not an offer.
        Every project is quoted in writing after a conversation, and only a signed agreement sets
        the scope, price and terms of a project.
      </p>

      <h2>Client projects</h2>
      <p>
        Work we do for a client is governed by the agreement we sign with that client. If that
        agreement and these terms ever disagree, the agreement wins.
      </p>

      <h2>Our content</h2>
      <p>
        The site&rsquo;s design, text and graphics belong to {site.name} unless noted otherwise.
        Case studies are shown with our clients&rsquo; permission, and their names and marks belong
        to them. Please don&rsquo;t copy the site&rsquo;s content without asking.
      </p>

      <h2>Using the site</h2>
      <p>
        Please don&rsquo;t try to break, overload or misuse the site or its forms, or send anything
        unlawful through them.
      </p>

      <h2>No warranty, limited liability</h2>
      <p>
        We work to keep the site accurate and available, but it&rsquo;s provided as is. To the
        extent the law allows, {site.name} isn&rsquo;t liable for losses arising from using the site
        itself. This doesn&rsquo;t limit anything in a signed client agreement.
      </p>

      <h2>Privacy</h2>
      <p>
        How we handle what you send us is described in our{" "}
        <Link href="/privacy/">Privacy Policy</Link>.
      </p>

      <h2>Law</h2>
      <p>
        These terms are governed by the laws of the State of Louisiana. Any dispute about them is
        handled in the courts of [PLACEHOLDER: parish] Parish, Louisiana.
      </p>

      <h2>Changes</h2>
      <p>If we change these terms, we&rsquo;ll update this page and the date at the top.</p>
    </LegalPage>
  );
}
