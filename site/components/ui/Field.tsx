import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import { CutFrame } from "./CutFrame";

/**
 * ════════════════════════════════════════════════════════════════════
 *  FORM FIELDS (PLAN §4.5, REFACTOR_AUDIT §3.6, C10, C11).
 *
 *  Input / select / textarea: white fill, 1px ink border, top-left `sm`
 *  cut, min height 48px, Manrope 16px (16px also stops iOS zooming on
 *  focus). Label above in mono caps. The focus ring follows the cut
 *  (CutFrame `ring`).
 *
 *  Errors stay in the palette (decision D5): ink text with an
 *  "Error —" prefix, plus a 2px signal bar along the bottom of the
 *  field. Never color alone, and never signal text on white.
 *
 *  Every field takes an explicit `id`, which ties the label, hint and
 *  error to the control (aria-describedby).
 * ════════════════════════════════════════════════════════════════════
 */

type FieldMeta = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Shows "(optional)" after the label. Required is the default. */
  optional?: boolean;
  className?: string;
};

const LABEL = "font-mono text-label-sm uppercase tracking-label-lg text-ink";

const CONTROL =
  "block w-full bg-transparent font-body text-base text-ink placeholder:text-steel focus-visible:shadow-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

function describedBy({ id, hint, error }: FieldMeta) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

function Messages({ id, hint, error }: FieldMeta) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="text-body-xs text-steel">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </>
  );
}

/** The error line, shared with fieldsets. */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="font-mono text-label uppercase tracking-label text-ink">
      <span className="font-medium">Error —</span> {children}
    </p>
  );
}

function Shell({ meta, children }: { meta: FieldMeta; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", meta.className)}>
      <label htmlFor={meta.id} className={LABEL}>
        {meta.label}
        {meta.optional && <span className="text-steel"> (optional)</span>}
      </label>
      {children}
      <Messages {...meta} />
    </div>
  );
}

function Frame({
  children,
  invalid,
  className,
}: {
  children: ReactNode;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <CutFrame
      size="sm"
      corners={["tl"]}
      fill="white"
      ring
      innerClassName={cn("relative", className)}
    >
      {children}
      {/* The error bar (D5): an element, not a box-shadow, so focus
          styles can't remove it. */}
      {invalid && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-signal"
        />
      )}
    </CutFrame>
  );
}

function controlProps(meta: FieldMeta) {
  return {
    id: meta.id,
    "aria-invalid": meta.error ? true : undefined,
    "aria-describedby": describedBy(meta),
    required: meta.optional ? undefined : true,
  };
}

function splitMeta<T extends FieldMeta>(props: T) {
  const { id, label, hint, error, optional, className, ...rest } = props;
  return { meta: { id, label, hint, error, optional, className }, rest };
}

export function TextField(
  props: FieldMeta & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">
) {
  const { meta, rest } = splitMeta(props);
  return (
    <Shell meta={meta}>
      <Frame invalid={!!meta.error}>
        <input {...rest} {...controlProps(meta)} className={cn(CONTROL, "min-h-input px-3.5")} />
      </Frame>
    </Shell>
  );
}

export function TextAreaField(
  props: FieldMeta & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">
) {
  const { meta, rest } = splitMeta(props);
  return (
    <Shell meta={meta}>
      <Frame invalid={!!meta.error}>
        <textarea
          rows={5}
          {...rest}
          {...controlProps(meta)}
          className={cn(CONTROL, "min-h-[140px] resize-y px-3.5 py-3")}
        />
      </Frame>
    </Shell>
  );
}

export function SelectField({
  options,
  placeholder,
  ...props
}: FieldMeta & {
  options: { value: string; label: string }[];
  /** First, empty option ("Choose one"). */
  placeholder?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className" | "children">) {
  const { meta, rest } = splitMeta(props);
  return (
    <Shell meta={meta}>
      <Frame invalid={!!meta.error}>
        <select
          // With a placeholder and nothing chosen, start on the placeholder.
          defaultValue={
            placeholder !== undefined && rest.value === undefined && rest.defaultValue === undefined
              ? ""
              : undefined
          }
          {...rest}
          {...controlProps(meta)}
          className={cn(CONTROL, "min-h-input cursor-pointer appearance-none pl-3.5 pr-11")}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-ink"
        >
          <path d="M1 1.5 6 6.5 11 1.5" />
        </svg>
      </Frame>
    </Shell>
  );
}

/**
 * A single checkbox. Square, 20px box, inside a label row that is at
 * least 44px tall, so the whole row is the target. Not clipped, so it
 * uses the global focus ring.
 */
export function Checkbox({
  id,
  label,
  className,
  ...rest
}: {
  id: string;
  label: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "className">) {
  return (
    <label
      htmlFor={id}
      className={cn("flex min-h-touch cursor-pointer items-center gap-3 text-body", className)}
    >
      <span className="relative inline-flex size-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          {...rest}
          className="peer size-5 cursor-pointer appearance-none border border-ink bg-white checked:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        />
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="square"
          className="pointer-events-none absolute inset-0 m-auto size-3.5 text-ice opacity-0 peer-checked:opacity-100"
        >
          <path d="M2.5 7.5 5.5 10.5 11.5 3.5" />
        </svg>
      </span>
      <span>{label}</span>
    </label>
  );
}

/**
 * A group of checkboxes under one question, e.g. "Services interested
 * in". A real <fieldset> and <legend>, so the question is announced
 * with each option.
 */
export function CheckboxGroup({
  id,
  legend,
  hint,
  error,
  optional,
  children,
  className,
}: Omit<FieldMeta, "label"> & { legend: ReactNode; children: ReactNode }) {
  const meta = { id, label: legend, hint, error, optional };
  return (
    <fieldset
      id={id}
      aria-describedby={describedBy(meta)}
      aria-invalid={error ? true : undefined}
      className={cn("flex flex-col gap-1", className)}
    >
      <legend className={cn(LABEL, "mb-1")}>
        {legend}
        {optional && <span className="text-steel"> (optional)</span>}
      </legend>
      {children}
      <div className="mt-1 flex flex-col gap-2">
        <Messages {...meta} />
      </div>
    </fieldset>
  );
}
