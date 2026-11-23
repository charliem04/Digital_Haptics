import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/site.config";
import { ctaLink, footerData, type FooterData } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { SocialIcons } from "@/components/SocialIcons";
import { Container } from "./Container";

/**
 * ════════════════════════════════════════════════════════════════════
 *  FOOTER (PLAN §3): all core pages, Blog, service-area city links,
 *  phone, email, legal links, copyright.
 *
 *  An ink slab. Text is ice (16.5:1); secondary text is ice at 70%
 *  (about 9:1); hover turns links signal, which is allowed here because
 *  signal on ink is 6.24:1 (signal is only banned as text on LIGHT
 *  grounds). Every link is at least 44px tall.
 *
 *  Live links only (lib/nav.ts). Cities always show as text, since they
 *  are the service area, and become links once their page has unique
 *  content (PLAN §5).
 * ════════════════════════════════════════════════════════════════════
 */
export function Footer() {
  return <FooterView data={footerData()} cta={ctaLink()} />;
}

const LINK =
  "inline-flex min-h-touch items-center no-underline transition-colors ease-brand text-text duration-[160ms] hover:text-amber active:text-muted";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className={`font-medium font-body text-room-caption text-muted`}>{title}</h2>
      <ul className="flex flex-col">{children}</ul>
    </div>
  );
}

export function FooterView({
  data,
  cta,
}: {
  data: FooterData;
  cta: { href: string; label: string } | null;
}) {
  const { contact } = data;

  return (
    <footer id="site-footer" className="relative z-10 border-t border-line bg-surface text-text">
      <Container className="flex flex-col gap-12 py-room-section-sm lg:py-room-section">
        <div className="flex flex-col justify-between gap-8 border-b pb-10 lg:flex-row lg:items-end border-line">
          <div className="flex max-w-[560px] flex-col gap-4">
            <Logo className="self-start" />
            <p className="text-body-sm text-muted">{site.seo.defaultDescription}</p>
          </div>
          {cta && (
            <Button href={cta.href} className="self-start lg:self-auto">
              {cta.label}
            </Button>
          )}
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {data.site.length > 0 && (
            <Column title="Site">
              {data.site.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={LINK}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </Column>
          )}

          {data.services.length > 0 && (
            <Column title="Services">
              {data.services.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={LINK}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </Column>
          )}

          <Column title={`Serving ${data.areaLabel}`}>
            {data.areas.map((a) => (
              <li key={a.label}>
                {a.href ? (
                  <Link href={a.href} className={LINK}>
                    {a.label}
                  </Link>
                ) : (
                  <span className="inline-flex items-center py-1.5 text-muted">{a.label}</span>
                )}
              </li>
            ))}
          </Column>

          {(contact.phone || contact.email) && (
            <Column title="Contact">
              {contact.phone && (
                <li>
                  <a href={contact.phone.href} className={`${LINK} gap-2`}>
                    {contact.phone.display}
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a href={contact.email.href} className={`${LINK} gap-2 break-all`}>
                    {contact.email.display}
                  </a>
                </li>
              )}
            </Column>
          )}
        </div>

        <div
          className={`flex flex-col gap-4 border-t pt-6 lg:flex-row lg:items-center lg:justify-between border-line font-body text-room-caption text-muted`}
        >
          <p>{data.copyright}</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {data.legal.length > 0 && (
              <ul className="flex flex-wrap gap-x-8">
                {data.legal.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={LINK}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <SocialIcons linkClassName={`${LINK} min-w-[44px] justify-center`} />
          </div>
        </div>
      </Container>
    </footer>
  );
}
