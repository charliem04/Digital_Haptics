"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { checkField } from "@/lib/intake-rules";
import { trackEvent } from "@/lib/tracking";
import { DEMO_MOCK } from "@/lib/demo";
import { useStillness } from "@/lib/useScrollMotion";
import { Checkbox, CheckboxGroup, TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { Marker } from "@/components/ui/Marker";
import { Turnstile, resetTurnstile } from "@/components/Turnstile";

/**
 * ════════════════════════════════════════════════════════════════════
 *  🚩 THE LIVE DEMO (automations) (PLAN §7). Rendered only with
 *  FEATURE_AUTOMATIONS_DEMO on; every word on it arrives as a prop from
 *  the server, so this file's JavaScript says nothing in a flag-off
 *  build.
 *
 *  Visitor enters a mobile number, ticks consent, submits a fake lead;
 *  /api/demo validates and returns the message sequence, which plays
 *  here as a timeline. In this phase nothing is texted (worker/demo.ts
 *  is a mock); in `next dev` the page's copy of the sequence is used.
 *
 *  PLAN §7 safeguards present: "this is a demo" label, consent box,
 *  Turnstile, per-IP rate limit on the endpoint, every message marked
 *  as a demo, and the number is not stored.
 * ════════════════════════════════════════════════════════════════════
 */
type Msg = { at: number; to: "customer" | "owner"; body: string };

export type DemoCopy = {
  label: string;
  title: string;
  lede: string;
  notice: string;
  consent: string;
  submit: string;
  sending: string;
  phoneLabel: string;
  consentLegend: string;
  consentError: string;
  failed: string;
  customer: string;
  owner: string;
  done: string;
};

export function LiveDemo({
  copy,
  mock,
  endpoint = "/api/demo",
}: {
  copy: DemoCopy;
  /** The sequence, for local dev only (lib/demo.ts). */
  mock: Msg[];
  endpoint?: string;
}) {
  const still = useStillness();
  const [phoneError, setPhoneError] = useState<string>();
  const [consentError, setConsentError] = useState<string>();
  const [status, setStatus] = useState<"idle" | "sending" | "playing" | "done" | "failed">("idle");
  const [shown, setShown] = useState<Msg[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function play(messages: Msg[]) {
    setShown([]);
    setStatus("playing");
    if (still) {
      setShown(messages);
      setStatus("done");
      trackEvent("demo_complete");
      return;
    }
    messages.forEach((m, i) => {
      timers.current.push(
        setTimeout(() => {
          setShown((s) => [...s, m]);
          if (i === messages.length - 1) {
            setStatus("done");
            trackEvent("demo_complete");
          }
        }, m.at * 1000)
      );
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const phone = String(fd.get("phone") ?? "");
    const consent = fd.get("consent") === "yes";
    const pErr = checkField("phone", phone, {
      trades: [],
      timelines: [],
      budgets: [],
      services: [],
    });
    setPhoneError(pErr);
    setConsentError(consent ? undefined : copy.consentError);
    if (pErr || !consent) return;

    trackEvent("demo_start");
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, consent, turnstile: fd.get("cf-turnstile-response") }),
      });
      // Single-use token: a retry (or a second run) needs a fresh one.
      resetTurnstile(form);
      if (res.ok) {
        const data = (await res.json()) as { messages: Msg[] };
        return play(data.messages);
      }
      if (DEMO_MOCK && res.status === 404) return play(mock);
      setStatus("failed");
    } catch {
      resetTurnstile(form);
      if (DEMO_MOCK) return play(mock);
      setStatus("failed");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <BoxedLabel active>{copy.label}</BoxedLabel>
        <p className="border-l-4 border-ink bg-white p-4 text-body-sm">{copy.notice}</p>
        <TextField
          id="demo-phone"
          name="phone"
          label={copy.phoneLabel}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          error={phoneError}
        />
        <CheckboxGroup id="demo-consent-group" legend={copy.consentLegend} error={consentError}>
          <Checkbox id="demo-consent" name="consent" value="yes" label={copy.consent} />
        </CheckboxGroup>
        <Turnstile action="demo" />
        {status === "failed" && (
          <p role="alert" className="font-mono text-label uppercase tracking-label">
            {copy.failed}
          </p>
        )}
        <div>
          <Button type="submit" disabled={status === "sending" || status === "playing"}>
            {status === "sending" ? copy.sending : copy.submit}
          </Button>
        </div>
      </form>

      {/* The timeline: announced politely as each message arrives. */}
      <ol aria-live="polite" className="flex flex-col gap-4 border-t border-ink pt-6">
        {shown.map((m, i) => (
          <li
            key={i}
            className={
              m.to === "owner"
                ? "ml-8 flex flex-col gap-2 bg-ink p-4 text-ice"
                : "mr-8 flex flex-col gap-2 border border-ink bg-white p-4"
            }
          >
            <span
              className={
                m.to === "owner"
                  ? "flex items-center gap-2 font-mono text-label-sm uppercase tracking-label text-ice/70"
                  : "flex items-center gap-2 font-mono text-label-sm uppercase tracking-label text-steel"
              }
            >
              <Marker size="dot" />
              {m.to === "owner" ? copy.owner : copy.customer}
            </span>
            <span className="text-body-sm">{m.body}</span>
          </li>
        ))}
        {status === "done" && <li className="text-body-sm text-steel-deep">{copy.done}</li>}
      </ol>
    </div>
  );
}
