import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../index.ts";
import { flags } from "../flags.generated.ts";
import { sweep } from "../deliver.ts";
import { validateIntake, checkField, toE164 } from "../../lib/intake-rules.ts";
import { intakeOptions } from "../intake.ts";
import { fakeCtx, makeEnv, mockFetch, post, validLead } from "./helpers.ts";

/* These tests run against the generated flags, which CI builds with
   every flag off: the state every deployed environment ships in. */
const flagsOff = !flags.automations && !flags.automationsDemo;

/* ── Shared rules ─────────────────────────────────────────────────── */

test("rules: a valid lead is cleaned and normalised", () => {
  const r = validateIntake(
    { ...validLead, name: "  Test \u0007 Person ", extra: "ignored" },
    intakeOptions()
  );
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.value.name, "Test Person");
  assert.equal(r.value.phone, "+13375550100");
  assert.equal(r.value.email, "test@example.test");
  assert.equal(r.value.message, "Line one\nLine two");
  assert.equal(r.value.website, null);
  assert.equal("extra" in r.value, false);
});

test("rules: every required field reports, in words", () => {
  const r = validateIntake({}, intakeOptions());
  assert.equal(r.ok, false);
  if (r.ok) return;
  for (const f of [
    "name",
    "business",
    "trade",
    "phone",
    "email",
    "services",
    "timeline",
    "message",
  ]) {
    assert.ok(r.errors[f as keyof typeof r.errors], `${f} should have an error`);
  }
  assert.equal(r.errors.website, undefined, "website is optional");
});

test("rules: values outside the lists are refused", () => {
  const opts = intakeOptions();
  assert.ok(checkField("trade", "astronaut", opts));
  assert.ok(checkField("timeline", "yesterday", opts));
  assert.ok(checkField("services", ["web-design", "mystery"], opts));
  assert.equal(checkField("budget", "", opts), undefined, "empty budget is fine");
});

test("rules: phone numbers", () => {
  assert.equal(toE164("337-555-0100"), "+13375550100");
  assert.equal(toE164("1 (337) 555 0100"), "+13375550100");
  assert.equal(toE164("555-0100"), null);
});

test("rules: flagged service is refused while its flag is off", { skip: !flagsOff }, () => {
  assert.ok(checkField("services", ["automations"], intakeOptions()));
  assert.equal(intakeOptions().smsConsentError, undefined, "no SMS consent field");
});

/* ── /api/intake ──────────────────────────────────────────────────── */

test("intake: stores first, answers 200, email waits when not configured", async () => {
  const { env, rows } = makeEnv();
  const { ctx, settle } = fakeCtx();
  const res = await worker.fetch(post("/api/intake", validLead), env, ctx);
  assert.equal(res.status, 200);
  const body = (await res.json()) as { ok: boolean; id: string };
  assert.equal(body.ok, true);
  await settle();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, body.id);
  assert.equal(rows[0].phone, "+13375550100");
  assert.equal(rows[0].email_status, "disabled");
  assert.equal(rows[0].webhook_status, flagsOff ? "off" : rows[0].webhook_status);
  assert.equal(rows[0].turnstile, "unconfigured");
  assert.equal(rows[0].services, JSON.stringify(["web-design"]));
});

test("intake: trailing slash works too", async () => {
  const { env } = makeEnv();
  const res = await worker.fetch(post("/api/intake/", validLead), env, fakeCtx().ctx);
  assert.equal(res.status, 200);
});

test("intake: invalid body returns field errors and stores nothing", async () => {
  const { env, rows } = makeEnv();
  const res = await worker.fetch(post("/api/intake", { name: "x" }), env, fakeCtx().ctx);
  assert.equal(res.status, 400);
  const body = (await res.json()) as { errors: Record<string, string> };
  assert.ok(body.errors.email);
  assert.equal(rows.length, 0);
});

test("intake: other origins, other methods, junk and huge bodies are refused", async () => {
  const { env, rows } = makeEnv();
  const ctx = fakeCtx().ctx;
  const cross = await worker.fetch(
    post("/api/intake", validLead, { Origin: "https://evil.test" }),
    env,
    ctx
  );
  assert.equal(cross.status, 403);
  const get = await worker.fetch(new Request("https://digitalhaptics.dev/api/intake"), env, ctx);
  assert.equal(get.status, 405);
  const junk = await worker.fetch(post("/api/intake", "not json"), env, ctx);
  assert.equal(junk.status, 400);
  const huge = await worker.fetch(
    post("/api/intake", { ...validLead, message: "x".repeat(20000) }),
    env,
    ctx
  );
  assert.equal(huge.status, 400);
  assert.equal(rows.length, 0);
});

test("intake: rate limited callers get 429", async () => {
  const { env } = makeEnv({
    LIMITER: { limit: async () => ({ success: false }) } as unknown as RateLimit,
  });
  const res = await worker.fetch(
    post("/api/intake", validLead, { "CF-Connecting-IP": "203.0.113.9" }),
    env,
    fakeCtx().ctx
  );
  assert.equal(res.status, 429);
});

test("intake: with a Turnstile secret, a bad token is refused and nothing stored", async () => {
  const f = mockFetch(() => Response.json({ success: false }));
  try {
    const { env, rows } = makeEnv({ TURNSTILE_SECRET_KEY: "test-secret" });
    const res = await worker.fetch(
      post("/api/intake", { ...validLead, turnstile: "bad" }),
      env,
      fakeCtx().ctx
    );
    assert.equal(res.status, 403);
    assert.equal(rows.length, 0);
    assert.match(f.calls[0].url, /turnstile\/v0\/siteverify/);
  } finally {
    f.restore();
  }
});

test("intake: with Turnstile and Resend configured, the lead is emailed", async () => {
  const f = mockFetch((url) =>
    url.includes("siteverify") ? Response.json({ success: true }) : Response.json({ id: "email-1" })
  );
  try {
    const { env, rows } = makeEnv({
      TURNSTILE_SECRET_KEY: "test-secret",
      RESEND_API_KEY: "test-key",
      LEAD_NOTIFY_TO: "owner@example.test",
      LEAD_NOTIFY_FROM: "Site <leads@example.test>",
    });
    const { ctx, settle } = fakeCtx();
    const res = await worker.fetch(
      post("/api/intake", { ...validLead, turnstile: "ok" }),
      env,
      ctx
    );
    assert.equal(res.status, 200);
    await settle();
    assert.equal(rows[0].turnstile, "passed");
    assert.equal(rows[0].email_status, "sent");
    const email = f.calls.find((c) => c.url.includes("resend"))!;
    const sent = JSON.parse(String(email.init!.body)) as Record<string, unknown>;
    assert.deepEqual(sent.to, ["owner@example.test"]);
    assert.equal(sent.reply_to, "test@example.test");
    assert.match(String(sent.subject), /Test Roofing/);
    assert.equal(
      (email.init!.headers as Record<string, string>)["Idempotency-Key"],
      `lead-${rows[0].id}`
    );
  } finally {
    f.restore();
  }
});

test("delivery: a Resend outage leaves the row failed, and the cron sends it later", async () => {
  let up = false;
  const f = mockFetch(() =>
    up ? Response.json({ id: "ok" }) : new Response("down", { status: 503 })
  );
  try {
    const { env, rows } = makeEnv({
      RESEND_API_KEY: "k",
      LEAD_NOTIFY_TO: "o@example.test",
      LEAD_NOTIFY_FROM: "s@example.test",
    });
    const { ctx, settle } = fakeCtx();
    await worker.fetch(post("/api/intake", validLead), env, ctx);
    await settle();
    assert.equal(rows[0].email_status, "failed");
    assert.equal(rows[0].email_attempts, 0, "a 5xx does not spend an attempt");
    up = true;
    assert.equal(await sweep(env), 1);
    assert.equal(rows[0].email_status, "sent");
  } finally {
    f.restore();
  }
});

test("delivery: leads captured before email was configured go out once it is", async () => {
  const { env, rows } = makeEnv();
  const { ctx, settle } = fakeCtx();
  await worker.fetch(post("/api/intake", validLead), env, ctx);
  await settle();
  assert.equal(rows[0].email_status, "disabled");
  const f = mockFetch(() => Response.json({ id: "ok" }));
  try {
    Object.assign(env, {
      RESEND_API_KEY: "k",
      LEAD_NOTIFY_TO: "o@x.test",
      LEAD_NOTIFY_FROM: "s@x.test",
    });
    await sweep(env);
    assert.equal(rows[0].email_status, "sent");
  } finally {
    f.restore();
  }
});

test("delivery: webhook never fires with the flag off", { skip: !flagsOff }, async () => {
  const f = mockFetch(() => Response.json({}));
  try {
    const { env, rows } = makeEnv({ AUTOMATIONS_WEBHOOK_URL: "https://hooks.example.test/x" });
    const { ctx, settle } = fakeCtx();
    await worker.fetch(post("/api/intake", validLead), env, ctx);
    await settle();
    await sweep(env);
    assert.equal(rows[0].webhook_status, "off");
    assert.equal(
      f.calls.some((c) => c.url.includes("hooks.example.test")),
      false
    );
  } finally {
    f.restore();
  }
});

/* ── /api/event and /api/demo ─────────────────────────────────────── */

test("events: known events are written, unknown ones refused", async () => {
  const points: unknown[] = [];
  const { env } = makeEnv({
    EVENTS: { writeDataPoint: (p: unknown) => points.push(p) } as unknown as AnalyticsEngineDataset,
  });
  const ok = await worker.fetch(
    post("/api/event", { e: "cta_click", loc: "hero", path: "/" }),
    env,
    fakeCtx().ctx
  );
  assert.equal(ok.status, 204);
  assert.deepEqual((points[0] as { blobs: string[] }).blobs, [
    "cta_click",
    "hero",
    "/",
    "production",
  ]);
  const bad = await worker.fetch(post("/api/event", { e: "drop_table" }), env, fakeCtx().ctx);
  assert.equal(bad.status, 400);
});

test(
  "events: demo events are refused while the demo flag is off",
  { skip: !flagsOff },
  async () => {
    const { env } = makeEnv();
    const res = await worker.fetch(post("/api/event", { e: "demo_start" }), env, fakeCtx().ctx);
    assert.equal(res.status, 400);
  }
);

test("demo: 404 while its flag is off", { skip: !flagsOff }, async () => {
  const { env } = makeEnv();
  const res = await worker.fetch(
    post("/api/demo", { phone: "3375550100", consent: true }),
    env,
    fakeCtx().ctx
  );
  assert.equal(res.status, 404);
});

test("unknown /api paths 404; everything else goes to the static site", async () => {
  const { env } = makeEnv();
  const api = await worker.fetch(
    new Request("https://digitalhaptics.dev/api/nope"),
    env,
    fakeCtx().ctx
  );
  assert.equal(api.status, 404);
  const page = await worker.fetch(
    new Request("https://digitalhaptics.dev/pricing/"),
    env,
    fakeCtx().ctx
  );
  assert.equal(await page.text(), "asset");
});

/* ── Flag on (run with FEATURE_AUTOMATIONS=true[_DEMO]) ───────────── */

test("flag on: the lead is forwarded to the webhook", { skip: !flags.automations }, async () => {
  const f = mockFetch(() => Response.json({}));
  try {
    const { env, rows } = makeEnv({
      AUTOMATIONS_WEBHOOK_URL: "https://hooks.example.test/x",
      AUTOMATIONS_WEBHOOK_SECRET: "s3cret",
    });
    const { ctx, settle } = fakeCtx();
    await worker.fetch(post("/api/intake", { ...validLead, smsConsent: true }), env, ctx);
    await settle();
    assert.equal(rows[0].webhook_status, "sent");
    const hook = f.calls.find((c) => c.url.includes("hooks.example.test"))!;
    assert.equal((hook.init!.headers as Record<string, string>)["X-Webhook-Secret"], "s3cret");
    const sent = JSON.parse(String(hook.init!.body)) as { lead: { smsConsent: boolean } };
    assert.equal(sent.lead.smsConsent, true);
  } finally {
    f.restore();
  }
});

test("flag on: SMS consent is required", { skip: !flags.automations }, async () => {
  const { env } = makeEnv();
  const noConsent: Record<string, unknown> = { ...validLead };
  delete noConsent.smsConsent;
  const res = await worker.fetch(post("/api/intake", noConsent), env, fakeCtx().ctx);
  assert.equal(res.status, 400);
  const body = (await res.json()) as { errors: Record<string, string> };
  assert.ok(body.errors.smsConsent);
});

test("demo flag on: mock sequence, nothing stored", { skip: !flags.automationsDemo }, async () => {
  const { env, rows } = makeEnv();
  const res = await worker.fetch(
    post("/api/demo", { phone: "3375550100", consent: true }),
    env,
    fakeCtx().ctx
  );
  assert.equal(res.status, 200);
  const body = (await res.json()) as { mock: boolean; messages: unknown[] };
  assert.equal(body.mock, true);
  assert.ok(body.messages.length > 0);
  assert.equal(rows.length, 0);
  const noConsent = await worker.fetch(
    post("/api/demo", { phone: "3375550100" }),
    env,
    fakeCtx().ctx
  );
  assert.equal(noConsent.status, 400);
});
