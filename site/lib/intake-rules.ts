/**
 * ════════════════════════════════════════════════════════════════════
 *  INTAKE RULES — one definition of a valid project inquiry.
 *
 *  Used by the form in the browser (components/start/IntakeForm.tsx)
 *  and by the Worker that receives it (worker/intake.ts), so the two can
 *  never disagree about what is acceptable. The browser checks to help
 *  the visitor; the Worker checks because a script can skip the form.
 *
 *  Pure on purpose: no imports beyond types, no path aliases, no
 *  environment. It runs in a browser, in a Worker and under node --test.
 *
 *  The allowed values for trade, timeline, budget and services are
 *  passed in, because they depend on content and on feature flags.
 * ════════════════════════════════════════════════════════════════════
 */

export type IntakeOptions = {
  trades: readonly string[];
  timelines: readonly string[];
  /** Empty means the form has no budget field. */
  budgets: readonly string[];
  /** Service slugs this build offers (flag-filtered). */
  services: readonly string[];
  /** Present only when the SMS consent box is on the form (🚩). */
  smsConsentError?: string;
};

/** What the Worker stores: cleaned, length-capped, normalised. */
export type IntakeValue = {
  name: string;
  business: string;
  trade: string;
  /** E.164, e.g. +13374125714. */
  phone: string;
  email: string;
  website: string | null;
  services: string[];
  timeline: string;
  budget: string | null;
  message: string;
  smsConsent: boolean | null;
};

export type FieldName =
  | "name"
  | "business"
  | "trade"
  | "phone"
  | "email"
  | "website"
  | "services"
  | "timeline"
  | "budget"
  | "message"
  | "smsConsent";

export type IntakeErrors = Partial<Record<FieldName, string>>;

/** Caps on every text field. Generous for people, small for abuse. */
export const LIMITS = {
  name: 120,
  business: 160,
  phone: 40,
  email: 254,
  website: 300,
  message: 4000,
  option: 60,
} as const;

/**
 * Trim, collapse whitespace, strip control characters, cap the length.
 * These strings end up in a database and an email; a newline in a name
 * is header-shaped to whatever renders it.
 */
export function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return (
    value
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max)
  );
}

/** Like clean(), but keeps line breaks (for the message). */
export function cleanMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return (
    value
      .replace(/\r\n?/g, "\n")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, max)
  );
}

/** A US number as E.164, or null if it isn't one. */
export function toE164(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE = /^(https?:\/\/)?[^\s./]+(\.[^\s./]+)+(\/\S*)?$/i;

/** One field's problem, in words, or undefined. */
export function checkField(
  name: FieldName,
  value: string | string[] | boolean | undefined,
  opts: IntakeOptions
): string | undefined {
  const v = typeof value === "string" ? value.trim() : "";
  switch (name) {
    case "name":
      return v ? undefined : "Enter your name.";
    case "business":
      return v ? undefined : "Enter your business name.";
    case "trade":
      if (!v) return "Choose your trade.";
      return opts.trades.includes(v) ? undefined : "Choose your trade from the list.";
    case "phone":
      if (!v) return "Enter a phone number we can call.";
      return toE164(v) ? undefined : "Enter a 10-digit US phone number.";
    case "email":
      if (!v) return "Enter an email we can reply to.";
      return EMAIL.test(v) && v.length <= LIMITS.email ? undefined : "Check the email address.";
    case "website":
      if (!v) return undefined;
      return WEBSITE.test(v) ? undefined : "Check the web address, or leave it blank.";
    case "services": {
      const list = Array.isArray(value) ? value : [];
      if (list.length === 0) return "Choose at least one.";
      return list.every((s) => opts.services.includes(s)) ? undefined : "Choose from the list.";
    }
    case "timeline":
      if (!v) return "Choose a timeline.";
      return opts.timelines.includes(v) ? undefined : "Choose a timeline from the list.";
    case "budget":
      if (!v) return undefined;
      return opts.budgets.includes(v) ? undefined : "Choose a budget from the list.";
    case "message":
      return v ? undefined : "Tell us a little about the job.";
    case "smsConsent":
      if (!opts.smsConsentError) return undefined;
      return value === true ? undefined : opts.smsConsentError;
  }
}

/** The fields this build's form has, in form order. */
export function fieldsFor(opts: IntakeOptions): FieldName[] {
  return [
    "name",
    "business",
    "trade",
    "phone",
    "email",
    "website",
    "services",
    "timeline",
    ...(opts.budgets.length ? (["budget"] as const) : []),
    "message",
    ...(opts.smsConsentError ? (["smsConsent"] as const) : []),
  ];
}

/**
 * Validate a submitted body (the Worker's side). Unknown keys are
 * ignored; every value is cleaned before it is checked.
 */
export function validateIntake(
  body: Record<string, unknown>,
  opts: IntakeOptions
): { ok: true; value: IntakeValue } | { ok: false; errors: IntakeErrors } {
  const services = Array.isArray(body.services)
    ? body.services.slice(0, 10).map((s) => clean(s, LIMITS.option))
    : [];
  const raw = {
    name: clean(body.name, LIMITS.name),
    business: clean(body.business, LIMITS.business),
    trade: clean(body.trade, LIMITS.option),
    phone: clean(body.phone, LIMITS.phone),
    email: clean(body.email, LIMITS.email).toLowerCase(),
    website: clean(body.website, LIMITS.website),
    services,
    timeline: clean(body.timeline, LIMITS.option),
    budget: clean(body.budget, LIMITS.option),
    message: cleanMultiline(body.message, LIMITS.message),
    smsConsent: body.smsConsent === true,
  };

  const errors: IntakeErrors = {};
  for (const f of fieldsFor(opts)) {
    const e = checkField(f, raw[f], opts);
    if (e) errors[f] = e;
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: raw.name,
      business: raw.business,
      trade: raw.trade,
      phone: toE164(raw.phone) as string,
      email: raw.email,
      website: raw.website || null,
      services: raw.services.filter((s, i) => raw.services.indexOf(s) === i),
      timeline: raw.timeline,
      budget: raw.budget || null,
      message: raw.message,
      smsConsent: opts.smsConsentError ? raw.smsConsent : null,
    },
  };
}
