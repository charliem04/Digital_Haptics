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
 *  "Islands" (owner's pick, 2026-11-25, lab option C): no bar. On
 *  desktop (lg+) the logo sits free on the left, the links share one
 *  glass pill in the centre, and "Start a Project ↘" sits free on the
 *  right. Mobile: logo + 48px menu button opening the full-screen menu.
 *
 *  The header is transparent, so on Home the hero pulls up under it and
 *  the liquid runs to the top of the page. Elsewhere it sits on room.
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
        <div className="flex h-20 items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Logo className="justify-self-start whitespace-nowrap" />
          {links.length > 0 && (
            <nav
              aria-label="Main"
              className="hidden rounded-control border border-text/[0.12] bg-room/55 p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_12px_32px_-12px_rgb(0_0_0/0.6)] backdrop-blur-xl backdrop-saturate-150 lg:block"
            >
              <NavLinks links={links} />
            </nav>
          )}
          <div className="flex items-center gap-3 justify-self-end">
            {cta && (
              <div className="hidden lg:block">
                <Button href={cta.href} size="sm">
                  {cta.label}
                </Button>
              </div>
            )}
            <MobileMenu links={links} cta={cta} contact={contact} />
          </div>
        </div>
      </Container>
    </header>
  );
}
