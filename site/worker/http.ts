/** Small response helpers shared by every /api route. */

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: BASE_HEADERS });
}

export function empty(status = 204): Response {
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Same-origin POSTs only. Origin stops another website posting on a
 * visitor's behalf; it stops nothing else (a script sets whatever it
 * likes), which is what Turnstile and the rate limiter are for.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("Origin");
  if (origin) return origin === new URL(req.url).origin;
  const site = req.headers.get("Sec-Fetch-Site");
  return !site || site === "same-origin";
}

/** Read a JSON object body, refusing anything larger than `max` bytes. */
export async function readJson(req: Request, max: number): Promise<Record<string, unknown> | null> {
  const declared = Number(req.headers.get("Content-Length") ?? "0");
  if (declared > max) return null;
  const text = await req.text();
  if (text.length > max) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** True when this caller is over the per-IP limit. A missing limiter never blocks. */
export async function limited(
  limiter: RateLimit | undefined,
  req: Request,
  scope: string
): Promise<boolean> {
  if (!limiter) return false;
  const ip = req.headers.get("CF-Connecting-IP") ?? "";
  if (!ip) return false;
  try {
    const { success } = await limiter.limit({ key: `${scope}:${ip}` });
    return !success;
  } catch {
    return false;
  }
}
