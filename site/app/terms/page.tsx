import type { Metadata } from "next";
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
 *  STUB. Written in Phase 5 (PLAN §9). Logged in CONTENT_TODO.md.
 *
 *  Cover: what the site is, that "starting at" prices are indicative
 *  until quoted in writing, intellectual property in the site and case
 *  study material, limitation of liability for the website itself,
 *  governing law (Louisiana).
 *
 *  Do NOT let these terms speak for client work: the signed scope of
 *  work governs a project, and nothing here should contradict it.
 *
 *  Not legal advice. Have an attorney read it before launch.
 * ════════════════════════════════════════════════════════════════════
 */
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>[PLACEHOLDER: terms of service, written in Phase 5]</p>
    </LegalPage>
  );
}
