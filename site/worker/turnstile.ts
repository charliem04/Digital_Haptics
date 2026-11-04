import type { Env } from "./env.ts";

/**
 * Cloudflare Turnstile, server side (PLAN §2: on every form).
 *
 * With TURNSTILE_SECRET_KEY set, a valid token is required. Without
 * it, the check is skipped and the row is marked `unconfigured`, so the
 * form works before the widget is set up, and the dashboard shows which
 * leads arrived unchecked. Set both keys before launch (SETUP.md §3).
 *
 * A token passes only if siteverify says success AND it was issued:
 *   · for this form (`action`: "intake" or "demo", set on the widget),
 *     so a token solved on one form can't be spent on another;
 *   · on this site (`hostname` equals the request's own host; the API is
 *     same-origin, so the page and the endpoint share a host).
 * Tokens are single-use: siteverify itself refuses a replay.
 * Any network error, timeout (10 s) or non-200 fails closed.
 */
export type TurnstileResult = "passed" | "unconfigured" | "failed";

const VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 10_000;

/**
 * Cloudflare's published dummy secrets (always-pass, always-fail, …)
 * answer with placeholder hostname and action, so those two checks are
 * skipped for them. They only ever accept dummy tokens, so this opens
 * nothing; real secrets start with "0x".
 */
const isDummySecret = (s: string) => /^[123]x0+AA$/.test(s);

export async function verifyTurnstile(
  env: Env,
  token: unknown,
  ip: string | null,
  expect: { action: string; hostname: string },
  fetcher: typeof fetch = fetch
): Promise<TurnstileResult> {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return "unconfigured";
  if (typeof token !== "string" || !token || token.length > 2048) return "failed";

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const res = await fetcher(VERIFY, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return "failed";
    const data = (await res.json()) as { success?: boolean; action?: string; hostname?: string };
    if (data.success !== true) return "failed";
    if (!isDummySecret(secret)) {
      if (data.action !== expect.action) return "failed";
      if (data.hostname !== expect.hostname) return "failed";
    }
    return "passed";
  } catch {
    // Turnstile unreachable or too slow: fail closed. The visitor sees
    // "couldn't verify" with the phone number; nothing unchecked is stored.
    return "failed";
  }
}
