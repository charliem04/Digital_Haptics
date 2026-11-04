import type { Env } from "./env.ts";
import { handleIntake } from "./intake.ts";
import { handleEvent } from "./events.ts";
import { handleDemo } from "./demo.ts";
import { sweep } from "./deliver.ts";
import { json } from "./http.ts";

/**
 * ════════════════════════════════════════════════════════════════════
 *  THE SITE WORKER (decision D1, revised: REFACTOR_AUDIT §9).
 *
 *  wrangler.jsonc sends /api/* here first (`run_worker_first`); every
 *  other path is served straight from the static export in out/ and
 *  never reaches this code. Routes:
 *
 *    POST /api/intake   the intake form (worker/intake.ts)
 *    POST /api/event    conversion events (worker/events.ts)
 *    POST /api/demo     🚩 automations demo, mock (worker/demo.ts)
 *
 *  Trailing slashes are accepted (next.config.mjs sets trailingSlash).
 *  The cron (every 15 minutes) retries undelivered emails and webhooks.
 * ════════════════════════════════════════════════════════════════════
 */
export default {
  async fetch(req, env, ctx): Promise<Response> {
    const path = new URL(req.url).pathname.replace(/\/+$/, "");

    switch (path) {
      case "/api/intake":
        return handleIntake(req, env, ctx);
      case "/api/event":
        return handleEvent(req, env);
      case "/api/demo":
        return handleDemo(req, env);
    }
    if (path === "/api" || path.startsWith("/api/")) return json({ error: "not found" }, 404);

    // Not normally reached (assets are served first); kept so a change
    // to run_worker_first can't turn the whole site into 404s.
    return env.ASSETS.fetch(req);
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      sweep(env)
        .then((n) => n && console.log(`[intake] cron retried ${n} delivery(ies)`))
        .catch((e) => console.error("[intake] cron sweep failed:", e))
    );
  },
} satisfies ExportedHandler<Env>;
