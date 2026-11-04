"use client";

import Script from "next/script";
import { site } from "@/site.config";

/** Widened: site.config.ts is `as const`. */
const siteKey: string = site.intake.turnstileSiteKey;

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

/**
 * The Cloudflare Turnstile widget.
 *
 * Turnstile's own script finds every `.cf-turnstile` on the page and
 * renders into it, then writes the token into a hidden input named
 * `cf-turnstile-response` inside that element, so the token arrives in
 * `new FormData(form)` with no React state to manage.
 *
 * `action` names the form ("intake", "demo"). The Worker checks it
 * (worker/turnstile.ts), so a token solved on one form can't be spent
 * on another.
 *
 * Renders nothing without a site key. The Worker is what enforces the
 * check. The script loads per form rather than in the layout: most
 * visitors never reach a form, and it's the site's only third-party
 * script.
 */
export function Turnstile({ action, className }: { action: string; className?: string }) {
  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <div
        className={`cf-turnstile ${className ?? ""}`}
        data-sitekey={siteKey}
        data-action={action}
        data-theme="light"
      />
    </>
  );
}

/**
 * Get a fresh token for the widget inside `root`. Tokens are single-use,
 * so after any send that didn't succeed (the Worker may have redeemed
 * it), a retry needs a new one.
 */
export function resetTurnstile(root: HTMLElement | null): void {
  const el = root?.querySelector<HTMLElement>(".cf-turnstile");
  if (!el) return;
  try {
    window.turnstile?.reset(el);
  } catch {
    // Not rendered yet: nothing to reset.
  }
}

/** Whether a token is expected at all. */
export function turnstileConfigured(): boolean {
  return siteKey.length > 0;
}
