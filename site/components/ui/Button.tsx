import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Arrow } from "./Arrow";

/**
 * Buttons (docs/VISUAL_GUIDE.md §8).
 *
 *   primary  amber fill, on-amber text and arrow (8.95:1)
 *   accent   text-colour fill, room text and arrow
 *   ghost    transparent, 1px text-colour border, no arrow
 *
 * Sizes: md is 52px tall, sm is 48px for dense rows. Both clear the 44px
 * touch target.
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
  "group/btn relative inline-flex items-center rounded-control font-body text-[1rem] font-medium no-underline transition-[color,background-color,transform] duration-[160ms] ease-brand active:translate-y-px disabled:cursor-not-allowed disabled:border disabled:border-line disabled:bg-raised disabled:text-muted";

const SIZES: Record<Size, string> = {
  md: "min-h-button gap-3 px-6 leading-[1.4]",
  sm: "min-h-button-sm gap-2.5 px-5 leading-[1.6]",
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-amber text-on-amber hover:bg-amber-hover",
  accent: "bg-text text-room hover:bg-muted",
  ghost: "border border-text text-text hover:bg-raised hover:text-text",
};

const ARROW: Record<Variant, string | null> = {
  primary: "text-on-amber group-disabled/btn:text-muted",
  accent: "text-room group-disabled/btn:text-muted",
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
