import type { Env } from "./env.ts";

/**
 * Cloudflare Turnstile, server side (PLAN §2: on every form).
 *
 * With TURNSTILE_SECRET_KEY set, a valid token is required. Without
 * it, the check is skipped and the row is marked `unconfigured`, so the
 * form works before the widget is set up, and the dashboard shows which
 * leads arrived unchecked. Set both keys before launch (SETUP.md §3).
 */
export type TurnstileResult = "passed" | "unconfigured" | "failed";

const VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  env: Env,
  token: unknown,
  ip: string | null,
  fetcher: typeof fetch = fetch
): Promise<TurnstileResult> {
  if (!env.TURNSTILE_SECRET_KEY) return "unconfigured";
  if (typeof token !== "string" || !token || token.length > 2048) return "failed";

  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const res = await fetcher(VERIFY, { method: "POST", body: form });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true ? "passed" : "failed";
  } catch {
    // Turnstile unreachable: fail closed. The visitor sees "couldn't
    // verify" with the phone number, and nothing unchecked is stored.
    return "failed";
  }
}
