import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Container } from "@/components/layout/Container";

/**
 * The opening block of every inner page: breadcrumbs, a section label,
 * the page's one <h1> (display small, caps) and an optional lead.
 * Inner pages get no flare: PLAN §4.4 keeps it to the home hero.
 */
export function PageHero({
  path,
  leafLabel,
  label,
  title,
  lead,
  children,
}: {
  path: string;
  /** For pages the registry can't name (a case study). */
  leafLabel?: string;
  label: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Container className="flex flex-col gap-6 pb-section-sm pt-6 lg:pb-16 lg:pt-10">
      <Breadcrumbs path={path} leafLabel={leafLabel} />
      <div className="flex flex-col gap-5">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="max-w-[18ch] font-display text-display-sm font-semibold uppercase">
          {title}
        </h1>
        {lead && <p className="max-w-[640px] text-body-lg text-steel-deep">{lead}</p>}
      </div>
      {children}
    </Container>
  );
}
