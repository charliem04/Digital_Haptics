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
import { Turnstile, resetTurnstile } from "@/components/Turnstile";
import { trackEvent } from "@/lib/tracking";
import {
  checkField,
  fieldsFor,
  type FieldName,
  type IntakeErrors,
  type IntakeOptions,
} from "@/lib/intake-rules";

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
 *  The rules are lib/intake-rules.ts, the same ones the Worker applies,
 *  so the two never disagree. Submits JSON to the intake endpoint
 *  (worker/intake.ts: validate → Turnstile → D1 → email). A 400 maps
 *  the Worker's field errors back onto the form; any other failure
 *  shows phone and email. On success: /start/thanks/.
 *
 *  Options come in as props from the server, so this file never
 *  imports content or flags itself.
 * ════════════════════════════════════════════════════════════════════
 */
type Errors = IntakeErrors;

const LABELS: Record<FieldName, string> = {
  name: "Your name",
  business: "Business name",
  trade: "Trade",
  phone: "Phone",
  email: "Email",
  website: "Current website",
  services: "Services interested in",
  timeline: "Timeline",
  budget: "Budget range",
  message: "Message",
  smsConsent: "",
};

export type SmsConsentCopy = { legend: string; label: string; error: string };

/** A field's value as the shared rules expect it. */
function read(name: FieldName, fd: FormData): string | string[] | boolean {
  if (name === "services") return fd.getAll("services").map(String);
  if (name === "smsConsent") return fd.get("smsConsent") === "yes";
  return String(fd.get(name) ?? "");
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
  const started = useRef(false);
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<FieldName[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "failed" | "busy" | "check">("idle");

  // The same rules the Worker applies (lib/intake-rules.ts).
  const opts: IntakeOptions = {
    trades: trades.map((o) => o.value),
    timelines: timelines.map((o) => o.value),
    budgets: budgets.map((o) => o.value),
    services: services.map((o) => o.value),
    smsConsentError: sms?.error,
  };
  const fields = fieldsFor(opts);
  const labelOf = (name: FieldName) => (name === "smsConsent" ? sms?.legend : LABELS[name]);

  /** Show every error and move focus to the summary. */
  const showErrors = (next: Errors) => {
    setErrors(next);
    const bad = fields.filter((f) => next[f]);
    setSummary(bad);
    if (bad.length) requestAnimationFrame(() => summaryRef.current?.focus());
  };

  /** Re-check one field when the visitor leaves it (once it has a value or an error). */
  const onBlur = (name: FieldName) => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const value = read(name, fd);
    const empty = value === "" || (Array.isArray(value) && value.length === 0);
    if (errors[name] === undefined && empty) return;
    setErrors((e) => ({ ...e, [name]: checkField(name, value, opts) }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const next: Errors = {};
    for (const f of fields) next[f] = checkField(f, read(f, fd), opts);
    if (fields.some((f) => next[f])) return showErrors(next);
    setErrors({});
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
      if (res.ok) {
        trackEvent("form_submit");
        router.push("/start/thanks/");
        return;
      }
      // Anything but success may have spent the token: get a fresh one.
      resetTurnstile(formRef.current);
      // The Worker re-checks with the same rules; show what it found.
      if (res.status === 400) {
        const data = (await res.json().catch(() => ({}))) as { errors?: Errors };
        if (data.errors && Object.keys(data.errors).length) {
          setStatus("idle");
          return showErrors(data.errors);
        }
      }
      setStatus(res.status === 429 ? "busy" : res.status === 403 ? "check" : "failed");
    } catch {
      resetTurnstile(formRef.current);
      setStatus("failed");
    }
  }

  const blur = (name: FieldName) => ({ onBlur: () => onBlur(name) });

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      // form_start: the first time anything in the form takes focus.
      onFocus={() => {
        if (started.current) return;
        started.current = true;
        trackEvent("form_start");
      }}
      noValidate
      className="flex flex-col gap-6"
    >
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

      <Turnstile action="intake" />

      {(status === "failed" || status === "busy" || status === "check") && (
        <div role="alert" className="flex flex-col gap-2 border-l-4 border-signal bg-white p-4">
          <p className="font-mono text-label font-medium uppercase tracking-label">
            Error —{" "}
            {status === "busy"
              ? "too many tries"
              : status === "check"
                ? "we couldn’t verify that"
                : "that didn’t send"}
          </p>
          <p className="text-body-sm text-ink">
            {status === "busy"
              ? "Wait a minute and try again. "
              : status === "check"
                ? "The spam check didn’t go through. Wait for it to finish and try again. "
                : "Nothing you typed is lost. Try again. "}
            Or reach us directly
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
