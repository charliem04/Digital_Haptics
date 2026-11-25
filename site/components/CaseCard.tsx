import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { motionConfig } from "@/motion.config";
import { cn } from "@/lib/cn";
import type { Photo } from "@/content/types";
import { Panel } from "./ui/Panel";
import { Arrow } from "./ui/Arrow";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CASE CARD: the screenshot, who it's for, and one result.
 *
 *  Kept deliberately simple (owner's request, 2026-11-25): an inset
 *  screenshot with a status pill, the client's name, trade and town, and
 *  the headline result. Everything else lives on the case study page.
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
  className,
}: CaseCardProps) {
  return (
    <Panel
      as={Link}
      href={href}
      fill="raised"
      widget
      className={cn("block no-underline text-text", className)}
      innerClassName="flex flex-col gap-1 p-2"
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

      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-room">
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
        <span className="absolute left-3 top-3 rounded-control bg-room/85 px-3 py-1 font-body text-room-caption text-text">
          {status}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 px-4 pb-4 pt-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="font-body text-room-step font-medium leading-snug">{client}</p>
          <p className="font-body text-room-small text-muted">
            {location ? `${trade} · ${location}` : trade}
          </p>
          <p className="pt-1 font-body text-room-small font-medium text-amber">{result}</p>
        </div>
        <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover/panel:border-text group-hover/panel:bg-room">
          <Arrow className="size-3.5" />
          <span className="sr-only">Read the case study</span>
        </span>
      </div>
    </Panel>
  );
}
