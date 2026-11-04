/**
 * Test doubles for the Worker: an in-memory D1 that understands the
 * handful of statements worker/db.ts issues, a fetch recorder, and a
 * request builder. Nothing here talks to Cloudflare or Resend.
 */
import type { Env } from "../env.ts";
import { flags } from "../flags.generated.ts";

type Row = Record<string, unknown>;

export function fakeDb() {
  const rows: Row[] = [];
  const statements: string[] = [];

  const prepare = (sql: string) => {
    let params: unknown[] = [];
    const stmt = {
      bind(...p: unknown[]) {
        params = p;
        return stmt;
      },
      async run() {
        statements.push(sql);
        if (/^\s*INSERT INTO leads/i.test(sql)) {
          const cols = sql
            .slice(sql.indexOf("(") + 1, sql.indexOf(")"))
            .split(",")
            .map((c) => c.trim());
          const row: Row = { email_attempts: 0, webhook_attempts: 0 };
          cols.forEach((c, i) => (row[c] = params[i]));
          rows.push(row);
        } else if (/^\s*UPDATE leads SET (\w+)_status/i.test(sql)) {
          const col = /UPDATE leads SET (\w+)_status/i.exec(sql)![1];
          const [status, spent, error, , sentAt, id] = params as [
            string,
            number,
            string | null,
            string,
            string,
            string,
          ];
          const row = rows.find((r) => r.id === id);
          if (row) {
            row[`${col}_status`] = status;
            row[`${col}_attempts`] = Number(row[`${col}_attempts`] ?? 0) + spent;
            row[`${col}_error`] = error;
            if (status === "sent") row[`${col}_sent_at`] = sentAt;
          }
        }
        return { success: true };
      },
      async all() {
        statements.push(sql);
        const col = /WHERE (\w+)_status IN/i.exec(sql)?.[1];
        const [max, limit] = params as [number, number];
        const results = col
          ? rows
              .filter(
                (r) =>
                  ["pending", "failed", "disabled"].includes(String(r[`${col}_status`])) &&
                  Number(r[`${col}_attempts`] ?? 0) < max
              )
              .slice(0, limit)
          : rows;
        return { results };
      },
    };
    return stmt;
  };

  return {
    rows,
    statements,
    db: {
      prepare,
      async batch(list: { run: () => Promise<unknown> }[]) {
        for (const s of list) await s.run();
        return [];
      },
    } as unknown as D1Database,
  };
}

export type Call = { url: string; init?: RequestInit };

/** Replace global fetch; returns the recorded calls and a restore(). */
export function mockFetch(respond: (url: string, init?: RequestInit) => Response) {
  const calls: Call[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push({ url, init });
    return respond(url, init);
  }) as typeof fetch;
  return { calls, restore: () => (globalThis.fetch = original) };
}

export function fakeCtx() {
  const pending: Promise<unknown>[] = [];
  return {
    ctx: {
      waitUntil: (p: Promise<unknown>) => pending.push(p),
      passThroughOnException() {},
    } as unknown as ExecutionContext,
    settle: () => Promise.all(pending),
  };
}

export function makeEnv(over: Partial<Env> = {}) {
  const { db, rows, statements } = fakeDb();
  const env = {
    ASSETS: { fetch: async () => new Response("asset") } as unknown as Fetcher,
    DB: db,
    SITE_ENV: "production",
    ...over,
  } as Env;
  return { env, rows, statements };
}

export const ORIGIN = "https://digitalhaptics.dev";

export function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

export const validLead = {
  name: "Test Person",
  business: "Test Roofing",
  trade: "roofing",
  phone: "(337) 555-0100",
  email: "Test@Example.test",
  services: ["web-design"],
  timeline: "asap",
  message: "Line one\nLine two",
  // 🚩 With FEATURE_AUTOMATIONS on, the form requires SMS consent.
  ...(flags.automations ? { smsConsent: true } : {}),
};
