import Image from "next/image";
import Link from "next/link";
import { cn, pad2 } from "@/lib/cn";
import type { Photo } from "@/content/types";
import { CutFrame } from "./ui/CutFrame";
import { Marker } from "./ui/Marker";
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
  className,
}: CaseCardProps) {
  const rows = [
    { k: "Client", v: client, strong: true },
    { k: "Trade", v: trade },
    { k: "Systems", v: systems },
  ];

  return (
    <CutFrame
      as={Link}
      href={href}
      size="md"
      fill="white"
      ring
      className={cn("block text-ink no-underline", className)}
      innerClassName="flex flex-col"
    >
      <div className="flex items-center justify-between border-b border-ink py-2.5 pl-6 pr-4 font-mono text-label-sm uppercase tracking-label">
        <span className="font-medium">Case.{pad2(index)}</span>
        <span className="flex items-center gap-1.5 text-steel">
          <Marker size="dot" />
          {status}
        </span>
      </div>

      <div className="relative aspect-[27/10] border-b border-ink bg-ice">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="absolute inset-0 size-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-dots-dense bg-dot-pitch-dense font-mono text-label uppercase text-steel">
            [ Project screenshot ]
          </div>
        )}
      </div>

      <dl className="font-mono text-label">
        {rows.map((r) => (
          <div
            key={r.k}
            className="flex justify-between gap-4 border-b border-hairline px-4 py-2.5"
          >
            <dt className="uppercase text-steel">{r.k}</dt>
            <dd className={cn("text-right uppercase", r.strong && "font-medium normal-case")}>
              {r.v}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 px-4 py-2.5">
          <dt className="uppercase text-steel">Result</dt>
          <dd className="flex items-center gap-2 text-right font-medium">
            <Marker size="dot" />
            {result}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between bg-ink px-4 py-3 font-mono text-label-sm uppercase tracking-label text-ice">
        Read case study
        <Arrow className="size-[15px] text-signal transition-transform duration-[250ms] ease-brand group-hover/cut:translate-x-[3px] group-hover/cut:translate-y-[3px]" />
      </div>
    </CutFrame>
  );
}
