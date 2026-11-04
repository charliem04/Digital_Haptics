import { contactLinks, ctaLink, headerLinks, type ContactLinks, type NavLink } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "./Container";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { OnHome } from "./OnHome";

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
      <Container>
        {/* On the home page at xl the hero rail occupies the top-right
            320px (mockup: nav padding-right 384 = rail + gutter). */}
        <OnHome
          home="xl:pr-sidebar"
          className="flex h-[var(--header-h)] items-center justify-between gap-6"
        >
          <Logo />
          {links.length > 0 && (
            <nav aria-label="Main" className="hidden lg:ml-auto lg:block">
              <NavLinks links={links} />
            </nav>
          )}
          <div className="flex items-center gap-3">
            {cta && (
              // The rail carries the CTA on the home page at xl.
              <OnHome home="xl:hidden" className="hidden lg:block">
                <Button href={cta.href} size="sm">
                  {cta.label}
                </Button>
              </OnHome>
            )}
            <MobileMenu links={links} cta={cta} contact={contact} />
          </div>
        </OnHome>
      </Container>
    </header>
  );
}
