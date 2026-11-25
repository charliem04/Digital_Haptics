import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Container } from "@/components/layout/Container";
import { MotionText } from "@/components/motion/MotionText";
import { MoltenArt, type MoltenComposition } from "@/components/page/MoltenArt";

/**
 * The opening block of every inner page: breadcrumbs, a section label,
 * the page's one <h1> and an optional lead. Pass `art` for a drifting
 * molten panel beside the copy on the main secondary pages.
 */
export function PageHero({
  path,
  leafLabel,
  label,
  title,
  lead,
  art,
  children,
}: {
  path: string;
  /** For pages the registry can't name (a case study). */
  leafLabel?: string;
  label: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  art?: MoltenComposition;
  children?: ReactNode;
}) {
  const copy = (
    <div className="flex flex-col gap-5">
      <SectionLabel>{label}</SectionLabel>
      {/* data-mt plays only after a page transition. On first load it is
          on screen, so it paints at once and LCP is untouched. */}
      <h1 data-mt="" className="max-w-[10.016em] font-body text-room-title font-medium">
        <MotionText>{title}</MotionText>
      </h1>
      {lead && (
        <p data-mt="" className="max-w-[640px] text-room-lede text-muted">
          {lead}
        </p>
      )}
    </div>
  );

  return (
    <Container className="flex flex-col gap-6 pb-10 pt-8 lg:pb-14 lg:pt-12">
      <Breadcrumbs path={path} leafLabel={leafLabel} />
      {art ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-stretch lg:gap-14">
          {copy}
          <MoltenArt composition={art} className="min-h-[200px] lg:min-h-[340px]" />
        </div>
      ) : (
        copy
      )}
      {children}
    </Container>
  );
}
