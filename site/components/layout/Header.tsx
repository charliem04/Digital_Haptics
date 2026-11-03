import { contactLinks, ctaLink, headerLinks, type ContactLinks, type NavLink } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "./Container";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";

/**
 * ════════════════════════════════════════════════════════════════════
 *  HEADER (PLAN §3, §4.5).
 *
 *  Desktop (lg+): logo · mono nav (Work · Services · Pricing · About) ·
 *  primary "Start a Project ↘". Mobile: logo + 48px ink menu button
 *  opening the full-screen menu.
 *
 *  Links come from lib/nav.ts, live only: until a page is built it
 *  isn't linked, and the CTA waits for /start. Not sticky: the mobile
 *  sticky CTA keeps the one action in reach (PLAN §1: one click from
 *  Start a Project).
 *
 *  <Header> reads the registry. <HeaderView> just renders what it is
 *  given, so the styleguide can show the full nav before it goes live.
 * ════════════════════════════════════════════════════════════════════
 */
export function Header() {
  return <HeaderView links={headerLinks()} cta={ctaLink()} contact={contactLinks()} />;
}

export function HeaderView({
  links,
  cta,
  contact,
}: {
  links: NavLink[];
  cta: { href: string; label: string } | null;
  contact: ContactLinks;
}) {
  return (
    <header className="relative z-30">
      <Container className="flex min-h-[88px] items-center justify-between gap-6 py-5 lg:min-h-[108px]">
        <Logo />
        {links.length > 0 && (
          <nav aria-label="Main" className="hidden lg:block">
            <NavLinks links={links} />
          </nav>
        )}
        <div className="flex items-center gap-3">
          {cta && (
            <div className="hidden lg:block">
              <Button href={cta.href} size="sm">
                {cta.label}
              </Button>
            </div>
          )}
          <MobileMenu links={links} cta={cta} contact={contact} />
        </div>
      </Container>
    </header>
  );
}
