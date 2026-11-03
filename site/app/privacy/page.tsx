import type { Metadata } from "next";
import { isIndexable } from "@/lib/routes";
import { robotsFor } from "@/lib/meta";
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
 *  STUB. Written in Phase 5 (PLAN §9). Logged in CONTENT_TODO.md.
 *
 *  Describe what THIS site actually does. The processors this stack
 *  introduces (only list the ones switched on at launch):
 *
 *   · Intake form → Cloudflare Worker → Cloudflare D1. Name,
 *     business, trade, phone, email, website, services, timeline,
 *     budget, message.
 *   · Lead notification email → Resend (transactional email).
 *   · Turnstile → Cloudflare. Bot check; sees the visitor's IP.
 *   · Cloudflare Web Analytics. Cookieless; say so plainly.
 *   · Conversion events → our endpoint → Workers Analytics Engine
 *     (decision D2). No identifiers.
 *   · Cal.com booking embed, loaded only on click. Cal.com sees the
 *     visitor directly and has its own policy; name it with
 *     schedulerName() from lib/booking.ts so both say the same company.
 *   · 🚩 FEATURE_AUTOMATIONS only: lead forwarded to the speed-to-lead
 *     webhook, SMS to the visitor (consent checkbox, STOP/HELP). Do not
 *     mention any of this while the flag is off.
 *
 *  Not legal advice. Have an attorney read it before launch.
 * ════════════════════════════════════════════════════════════════════
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>[PLACEHOLDER: privacy policy, written in Phase 5]</p>
    </LegalPage>
  );
}
