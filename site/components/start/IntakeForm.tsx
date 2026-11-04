"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import type { Option } from "@/content/types";
import type { ContactLinks } from "@/lib/nav";
import {
  Checkbox,
  CheckboxGroup,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/Turnstile";

/**
 * ════════════════════════════════════════════════════════════════════
 *  INTAKE FORM (PLAN §5 /start). The one intake path on the site.
 *
 *  Fields: name, business, trade, phone, email, current website
 *  (optional), services, timeline, budget (optional; hidden until
 *  ranges exist), message. Turnstile when a site key is configured.
 *  Flag on only: SMS consent. Its wording arrives as the `sms` prop,
 *  set by the server only when FEATURE_AUTOMATIONS is on, so a
 *  flag-off build ships none of it in this file's JavaScript.
 *
 *  Validation is inline and in words (PLAN §5 "clear inline
 *  validation"): each field says what's wrong on blur and on submit,
 *  and a failed submit puts an error summary first and moves focus to
 *  it, so screen-reader and keyboard users land on the problem.
 *
 *  Submits JSON to the intake endpoint (site.config.ts). The endpoint
 *  (validate → Turnstile → D1 → email) is built in Phase 4; until it
 *  answers, a submit shows the failure state with phone and email.
 *  On success: /start/thanks/.
 *
 *  Options come in as props from the server, so this file never
 *  imports content or flags itself.
 * ════════════════════════════════════════════════════════════════════
 */
type Errors = Partial<Record<string, string>>;

const LABELS: Record<string, string> = {
  name: "Your name",
  business: "Business name",
  trade: "Trade",
  phone: "Phone",
  email: "Email",
  website: "Current website",
  services: "Services interested in",
  timeline: "Timeline",
  message: "Message",
};

export type SmsConsentCopy = { legend: string; label: string; error: string };

const digits = (v: string) => v.replace(/\D/g, "");

/** One field's problem, in words, or undefined. */
function check(name: string, form: FormData): string | undefined {
  const v = String(form.get(name) ?? "").trim();
  switch (name) {
    case "name":
      return v ? undefined : "Enter your name.";
    case "business":
      return v ? undefined : "Enter your business name.";
    case "trade":
      return v ? undefined : "Choose your trade.";
    case "phone": {
      if (!v) return "Enter a phone number we can call.";
      const d = digits(v);
      const ok = d.length === 10 || (d.length === 11 && d.startsWith("1"));
      return ok ? undefined : "Enter a 10-digit US phone number.";
    }
    case "email":
      if (!v) return "Enter an email we can reply to.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : "Check the email address.";
    case "website":
      if (!v) return undefined;
      return /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(v)
        ? undefined
        : "Check the web address, or leave it blank.";
    case "services":
      return form.getAll("services").length ? undefined : "Choose at least one.";
    case "timeline":
      return v ? undefined : "Choose a timeline.";
    case "message":
      return v ? undefined : "Tell us a little about the job.";
    default:
      return undefined;
  }
}

export function IntakeForm({
  endpoint,
  trades,
  timelines,
  budgets,
  services,
  sms,
  contact,
}: {
  endpoint: string;
  trades: Option[];
  timelines: Option[];
  budgets: Option[];
  services: Option[];
  /** 🚩 FEATURE_AUTOMATIONS only: the SMS consent checkbox copy. */
  sms?: SmsConsentCopy;
  contact: ContactLinks;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "failed">("idle");

  const fields = [
    "name",
    "business",
    "trade",
    "phone",
    "email",
    "website",
    "services",
    "timeline",
    "message",
    ...(sms ? ["smsConsent"] : []),
  ];

  /** Built-in checks, plus the consent box when it exists. */
  const validate = (name: string, fd: FormData) =>
    name === "smsConsent" ? (fd.get("smsConsent") ? undefined : sms?.error) : check(name, fd);
  const labelOf = (name: string) => (name === "smsConsent" ? sms?.legend : LABELS[name]);

  /** Re-check one field when the visitor leaves it (only once it's shown an error, or has a value). */
  const onBlur = (name: string) => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const had = errors[name] !== undefined;
    const value = String(fd.get(name) ?? "").trim();
    if (!had && !value) return;
    setErrors((e) => ({ ...e, [name]: validate(name, fd) }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const next: Errors = {};
    for (const f of fields) next[f] = validate(f, fd);
    setErrors(next);
    const bad = fields.filter((f) => next[f]);
    if (bad.length) {
      setSummary(bad);
      // Let the summary render, then move focus to it.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSummary([]);

    // Honeypot: real people never see or fill this field.
    if (String(fd.get("company_url") ?? "")) return;

    setStatus("sending");
    try {
      const payload = {
        name: fd.get("name"),
        business: fd.get("business"),
        trade: fd.get("trade"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        website: fd.get("website") || undefined,
        services: fd.getAll("services"),
        timeline: fd.get("timeline"),
        budget: fd.get("budget") || undefined,
        message: fd.get("message"),
        smsConsent: sms ? fd.get("smsConsent") === "yes" : undefined,
        turnstile: fd.get("cf-turnstile-response") || undefined,
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.push("/start/thanks/");
    } catch {
      setStatus("failed");
    }
  }

  const blur = (name: string) => ({ onBlur: () => onBlur(name) });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {summary.length > 0 && (
        // Focused by script after a failed submit, so screen readers read
        // it. It isn't a control, so it gets no ring.
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          // deliberate-ignore outline-none
          className="flex flex-col gap-2 border-l-4 border-signal bg-white p-4 focus:outline-none"
        >
          <p className="font-mono text-label font-medium uppercase tracking-label">
            Error — {summary.length === 1 ? "one field needs" : `${summary.length} fields need`} a
            look
          </p>
          <ul className="flex flex-col">
            {summary.map((f) => (
              <li key={f}>
                <a
                  href={`#intake-${f}`}
                  className="inline-flex min-h-touch items-center text-body-sm text-ink underline decoration-signal decoration-2 underline-offset-4"
                >
                  {labelOf(f)}: {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          id="intake-name"
          name="name"
          label="Your name"
          autoComplete="name"
          error={errors.name}
          {...blur("name")}
        />
        <TextField
          id="intake-business"
          name="business"
          label="Business name"
          autoComplete="organization"
          error={errors.business}
          {...blur("business")}
        />
        <SelectField
          id="intake-trade"
          name="trade"
          label="Trade"
          placeholder="Choose one"
          options={trades}
          error={errors.trade}
          {...blur("trade")}
        />
        <TextField
          id="intake-phone"
          name="phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          error={errors.phone}
          {...blur("phone")}
        />
        <TextField
          id="intake-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...blur("email")}
        />
        <TextField
          id="intake-website"
          name="website"
          label="Current website"
          type="url"
          inputMode="url"
          optional
          placeholder="https://"
          error={errors.website}
          {...blur("website")}
        />
      </div>

      <CheckboxGroup id="intake-services" legend="Services interested in" error={errors.services}>
        {services.map((s) => (
          <Checkbox
            key={s.value}
            id={`intake-service-${s.value}`}
            name="services"
            value={s.value}
            label={s.label}
            onChange={() => errors.services && onBlur("services")}
          />
        ))}
      </CheckboxGroup>

      <div className="grid gap-6 md:grid-cols-2">
        <SelectField
          id="intake-timeline"
          name="timeline"
          label="Timeline"
          placeholder="Choose one"
          options={timelines}
          error={errors.timeline}
          {...blur("timeline")}
        />
        {budgets.length > 0 && (
          <SelectField
            id="intake-budget"
            name="budget"
            label="Budget range"
            placeholder="Choose one"
            optional
            options={budgets}
          />
        )}
      </div>

      <TextAreaField
        id="intake-message"
        name="message"
        label="Message"
        placeholder="What do you need, and what isn't working now?"
        error={errors.message}
        {...blur("message")}
      />

      {sms && (
        <CheckboxGroup id="intake-smsConsent" legend={sms.legend} error={errors.smsConsent}>
          <Checkbox
            id="intake-sms-consent"
            name="smsConsent"
            value="yes"
            label={sms.label}
            onChange={() => errors.smsConsent && onBlur("smsConsent")}
          />
        </CheckboxGroup>
      )}

      {/* Honeypot: off-screen and out of the tab order. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="intake-company-url">Leave this empty</label>
        <input id="intake-company-url" name="company_url" tabIndex={-1} autoComplete="off" />
      </div>

      <Turnstile />

      {status === "failed" && (
        <div role="alert" className="flex flex-col gap-2 border-l-4 border-signal bg-white p-4">
          <p className="font-mono text-label font-medium uppercase tracking-label">
            Error — that didn&rsquo;t send
          </p>
          <p className="text-body-sm text-ink">
            Nothing you typed is lost. Try again, or reach us directly
            {contact.phone && (
              <>
                {" "}
                at{" "}
                <a href={contact.phone.href} className="text-ink underline">
                  {contact.phone.display}
                </a>
              </>
            )}
            {contact.email && (
              <>
                {contact.phone ? " or " : " at "}
                <a href={contact.email.href} className="text-ink underline">
                  {contact.email.display}
                </a>
              </>
            )}
            .
          </p>
        </div>
      )}

      <div>
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send it"}
        </Button>
      </div>
    </form>
  );
}
