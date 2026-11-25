import { contactLinks, ctaLink, headerLinks, type ContactLinks, type NavLink } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "./Container";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { HeaderShell } from "./HeaderShell";

/**
 * ════════════════════════════════════════════════════════════════════
 *  HEADER (PLAN §3, §4.5).
 *
 *  "Islands" (owner's pick, 2026-11-25, lab option C): no bar. On
 *  desktop (lg+) the logo sits free on the left, the links share one
 *  glass pill in the centre, and "Start a Project ↘" sits free on the
 *  right. Mobile: logo + 48px menu button opening the full-screen menu.
 *
 *  The header is transparent, so on Home the hero pulls up under it and
 *  the liquid runs to the top of the page. Elsewhere it sits on room.
 *
 *  Sticky (owner's request, 2026-11-25). Scrolling down shrinks it
 *  into a small glass capsule docked at the top edge; scrolling up grows
 *  it back to full size. HeaderShell tracks the scroll direction and the
 *  CSS in app/globals.css ("HEADER") animates between the states. Its
 *  height never changes, so the page under it never moves.
 *
 *  Links come from lib/nav.ts, live only: until a page is built it
 *  isn't linked, and the CTA waits for /start.
 *
 *  <Header> reads the registry. <HeaderView> just renders what it is
 *  given, so the styleguide can show the full nav before it goes live.
 * ════════════════════════════════════════════════════════════════════
 */
export function Header() {
  return (
    <HeaderShell>
      <HeaderBar links={headerLinks()} cta={ctaLink()} contact={contactLinks()} />
    </HeaderShell>
  );
}

type HeaderProps = {
  links: NavLink[];
  cta: { href: string; label: string } | null;
  contact: ContactLinks;
};

/** The header as it sits at the top of a page, not sticky (styleguide). */
export function HeaderView(props: HeaderProps) {
  return (
    <header className="site-header-static">
      <HeaderBar {...props} />
    </header>
  );
}

function HeaderBar({ links, cta, contact }: HeaderProps) {
  return (
    <Container>
      <div className="site-header-bar flex items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Logo className="justify-self-start whitespace-nowrap" />
        {links.length > 0 && (
          <nav aria-label="Main" className="site-header-links hidden lg:block">
            <NavLinks links={links} />
          </nav>
        )}
        <div className="flex items-center gap-3 justify-self-end">
          {cta && (
            <div className="site-header-cta hidden lg:block">
              <Button href={cta.href} size="sm">
                {cta.label}
              </Button>
            </div>
          )}
          <MobileMenu links={links} cta={cta} contact={contact} />
        </div>
      </div>
    </Container>
  );
}
