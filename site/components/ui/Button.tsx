import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Arrow } from "./Arrow";

/**
 * Buttons (PLAN §4.5, REFACTOR_AUDIT §3.6).
 *
 *   primary  signal fill, ink text, ink ↘      (ink on signal 6.24:1)
 *   accent   ink fill, ice text, signal ↘      (signal on ink 6.24:1)
 *   ghost    transparent, 1px ink border, no arrow
 *
 * Sizes: md is 52px tall (PLAN), sm is 48px for dense rows (C9). Both
 * clear the 44px touch target.
 *
 * Pass `href` for a link (rendered with next/link), otherwise it is a
 * real <button>. Hover nudges the arrow along its own direction; the
 * global reduced-motion rule in app/globals.css stills it.
 */

type Variant = "primary" | "accent" | "ghost";
type Size = "md" | "sm";

type Common = {
  variant?: Variant;
  size?: Size;
  /** Stretch to the container, label left and arrow right. */
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type AsLink = Common & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "children" | "className"
  >;
type AsButton = Common & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className"
  >;

const BASE =
  // active: a 1px press, so a tap has a visible receipt on touch screens
  // where hover never fires.
  "group/btn relative inline-flex items-center font-mono font-medium uppercase tracking-label-sm no-underline transition-[color,background-color,transform] duration-[250ms] ease-brand active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";

const SIZES: Record<Size, string> = {
  md: "min-h-button gap-3 px-6 text-label-lg",
  sm: "min-h-button-sm gap-2.5 px-5 text-label",
};

const VARIANTS: Record<Variant, string> = {
  // Hover: an inset ink edge. Drawn with a pseudo-element, not a
  // box-shadow, so it never overrides the focus ring's shadow.
  primary:
    "bg-signal text-ink after:pointer-events-none after:absolute after:inset-0 after:border-2 after:border-ink after:opacity-0 after:transition-opacity after:duration-[250ms] hover:after:opacity-100",
  // ice on steel-deep is 7.91:1.
  accent: "bg-ink text-ice hover:bg-steel-deep",
  ghost: "border border-ink text-ink hover:bg-ink hover:text-ice",
};

const ARROW: Record<Variant, string | null> = {
  primary: "text-ink",
  accent: "text-signal",
  ghost: null,
};

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", block = false, className, children } = props;
  const classes = cn(
    BASE,
    SIZES[size],
    VARIANTS[variant],
    block && "w-full justify-between",
    className
  );
  const arrowTone = ARROW[variant];
  const content = (
    <>
      <span>{children}</span>
      {arrowTone && (
        <Arrow
          className={cn(
            size === "md" ? "size-[17px]" : "size-4",
            arrowTone,
            "transition-transform duration-[250ms] ease-brand group-hover/btn:translate-x-[3px] group-hover/btn:translate-y-[3px]"
          )}
        />
      )}
    </>
  );

  if (props.href !== undefined) {
    const { href, ...rest } = stripCommon(props);
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  const { type, ...rest } = stripCommon(props);
  return (
    <button type={type ?? "button"} className={classes} {...rest}>
      {content}
    </button>
  );
}

/** The DOM attributes left once this component's own props are taken out. */
function stripCommon<T extends Common>(props: T): Omit<T, keyof Common> {
  const { variant, size, block, className, children, ...rest } = props;
  void variant;
  void size;
  void block;
  void className;
  void children;
  return rest;
}
