import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { motionConfig } from "@/motion.config";
import { cn, pad2 } from "@/lib/cn";
import type { Photo } from "@/content/types";
import { Panel } from "./ui/Panel";
import { Arrow } from "./ui/Arrow";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CASE CARD (PLAN §4.5, REFACTOR_AUDIT §3.6).
 *
 *  `md` cut frame on white. Header strip (CASE.01 + status), screenshot
 *  area, CLIENT / TRADE / SYSTEMS / RESULT rows, and an ink
 *  "Read case study ↘" bar. The whole card is one link; its focus ring
 *  follows the cut.
 *
 *  Never pass invented client names or results (PLAN, top). Until a
 *  case study is confirmed, the values are bracketed placeholders and
 *  the card isn't published (PLAN §10).
 * ════════════════════════════════════════════════════════════════════
 */
/** Plain small Manrope inside `.room` (VISUAL_GUIDE §3). */
export type CaseCardProps = {
  index: number;
  href: string;
  client: string;
  trade: string;
  systems: string;
  result: string;
  /** Status in the header strip, e.g. "Live site". */
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
  systems,
  result,
  status = "Live site",
  image,
  priority = false,
  className,
}: CaseCardProps) {
  const rows = [
    { k: "Client", v: client, strong: true },
    { k: "Trade", v: trade },
    { k: "Systems", v: systems },
  ];

  return (
    <Panel
      as={Link}
      href={href}
      fill="raised"
      widget
      hover
      className={cn("block no-underline text-text", className)}
      innerClassName="flex flex-col overflow-hidden"
    >
      {motionConfig.card === "rim" && (
        <span
          aria-hidden
          className="motion-trim"
          data-motion-live=""
          style={{ "--i": index } as CSSProperties}
        />
      )}
      <div
        className={cn(
          "flex items-center justify-between border-b py-2.5 border-line px-5 font-body text-room-small"
        )}
      >
        <span className="font-medium">Case.{pad2(index)}</span>
        <span className="flex items-center gap-1.5 text-muted">{status}</span>
      </div>

      <div className="relative aspect-[16/10] border-b border-line bg-room">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority={priority}
            className="absolute inset-0 size-full object-cover object-top"
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-none text-muted font-body text-room-small"
            )}
          >
            [ Project screenshot ]
          </div>
        )}
      </div>

      <dl className={cn("font-body text-room-small")}>
        {rows.map((r) => (
          <div key={r.k} className="flex justify-between gap-4 border-b py-2.5 border-line px-5">
            <dt className="text-muted">{r.k}</dt>
            <dd className={cn("text-right", r.strong && "font-medium")}>{r.v}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 py-2.5 px-5">
          <dt className="text-muted">Result</dt>
          <dd className="flex items-center gap-2 text-right font-medium">{result}</dd>
        </div>
      </dl>

      <div
        className={cn(
          "mt-auto flex items-center justify-between py-3 min-h-12 border-t border-line bg-transparent px-5 font-medium text-text group-hover/panel:underline font-body text-room-small"
        )}
      >
        Read case study
        <Arrow className="size-[15px] transition-transform ease-brand group-hover/panel:translate-x-[3px] group-hover/panel:translate-y-[3px] text-amber duration-[160ms]" />
      </div>
    </Panel>
  );
}
