"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { site } from "@/site.config";

/** Widened: site.config.ts is `as const`. */
const siteKey: string = site.intake.turnstileSiteKey;

declare global {
  interface Window {
    turnstile?: {
      reset: (widget?: string | HTMLElement) => void;
      render?: (
        el: HTMLElement,
        options: { sitekey: string; action: string; theme: "light" }
      ) => string;
    };
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
export function Turnstile({
  action,
  className,
  load = true,
}: {
  action: string;
  className?: string;
  /** False holds back the script, which is heavy, until the form is used. */
  load?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);

  // The script auto-renders only once, when it first loads. After a
  // client-side return to this page it is already there, so render here.
  useEffect(() => {
    const el = box.current;
    if (!load || !siteKey || !el || !window.turnstile?.render) return;
    if (el.querySelector("iframe, input")) return;
    window.turnstile.render(el, { sitekey: siteKey, action, theme: "light" });
  }, [load, action]);

  if (!siteKey) return null;

  return (
    <>
      {load && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}
      <div
        ref={box}
        className={`cf-turnstile min-h-[65px] ${className ?? ""}`}
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
