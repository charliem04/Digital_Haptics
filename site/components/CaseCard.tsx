import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { motionConfig } from "@/motion.config";
import { cn } from "@/lib/cn";
import type { Photo } from "@/content/types";
import { Arrow } from "./ui/Arrow";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CASE CARD: the screenshot, who it's for, and one result.
 *
 *  Kept deliberately simple (owner's request, 2026-11-25): a clear card
 *  with a thin outline and squircle corners (lab option C), the
 *  screenshot edge to edge across the top with a status pill, then the
 *  client's name, trade and town, and the headline result. Everything else lives on the case study page.
 *  The whole card is one link.
 *
 *  Never pass invented client names or results (PLAN, top). Until a
 *  case study is confirmed, the values are bracketed placeholders and
 *  the card isn't published (PLAN §10).
 * ════════════════════════════════════════════════════════════════════
 */
export type CaseCardProps = {
  index: number;
  href: string;
  client: string;
  trade: string;
  /** Town, e.g. "Scott, LA". */
  location?: string;
  result: string;
  /** Status pill over the screenshot, e.g. "Live site". */
  status?: string;
  image?: Photo;
  /** Load the screenshot right away, for a card at the top of a page. */
  priority?: boolean;
  /** Fade in with the widget cascade. Off in the reel, where the pane fades instead. */
  widget?: boolean;
  className?: string;
};

export function CaseCard({
  index,
  href,
  client,
  trade,
  location,
  result,
  status = "Live site",
  image,
  priority = false,
  widget = true,
  className,
}: CaseCardProps) {
  return (
    <Link
      href={href}
      data-widget={widget ? "" : undefined}
      className={cn(
        "group/panel relative isolate flex flex-col overflow-hidden rounded-panel border no-underline transition-colors duration-200 border-text/[0.14] text-text hover:border-text/40",
        className
      )}
    >
      {/* The glowing edge from motion.config.ts, off by default now. */}
      {motionConfig.card === "rim" && (
        <span
          aria-hidden
          className="motion-trim"
          data-motion-live=""
          style={{ "--i": index } as CSSProperties}
        />
      )}

      <div className="relative aspect-[16/10] overflow-hidden bg-room">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority={priority}
            className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 ease-brand group-hover/panel:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/panel:scale-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-body text-room-small text-muted">
            [ Project screenshot ]
          </div>
        )}
        <span className="absolute left-5 top-5 rounded-control bg-room/85 px-3 py-1 font-body text-room-caption text-text">
          {status}
        </span>
      </div>

      {/* Fixed rows, so cards side by side line up: the category on one
          line, the name in a two-line slot, and the key result with the
          arrow pinned to the bottom. */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="truncate font-body text-room-small text-muted">
            {location ? `${trade} · ${location}` : trade}
          </p>
          <p className="line-clamp-2 min-h-[2lh] font-body text-room-step font-medium leading-snug">
            {client}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4">
          <p className="min-w-0 truncate font-body text-room-small font-medium text-amber">
            {result}
          </p>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover/panel:border-text group-hover/panel:bg-room">
            <Arrow className="size-3.5" />
            <span className="sr-only">Read the case study</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
