"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { ContactLinks, NavLink } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * ════════════════════════════════════════════════════════════════════
 *  MOBILE MENU (PLAN §4.5): 48px ink button → full-screen menu.
 *
 *  A native modal <dialog>, which gives the keyboard behaviour PLAN §8
 *  asks for without hand-rolled traps: focus moves into the menu,
 *  Tab stays inside it, the page behind is inert, Escape closes it, and
 *  focus returns to the menu button afterwards.
 *
 *  Also closes on navigation, on a link to the page you're already on,
 *  and when the viewport widens to the desktop nav (lg). Page scroll is
 *  locked while open.
 * ════════════════════════════════════════════════════════════════════
 */
const ICON_BUTTON =
  "flex size-12 items-center justify-center transition-colors ease-brand active:translate-y-px rounded-control border border-line bg-surface text-text duration-[160ms] hover:bg-raised";

export function MobileMenu({
  links,
  cta,
  contact,
}: {
  links: NavLink[];
  cta: { href: string; label: string } | null;
  contact: ContactLinks;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const id = useId();
  const pathname = usePathname();

  const close = () => dialog.current?.close();

  // Close after a client-side navigation.
  useEffect(() => {
    close();
  }, [pathname]);

  // Close when the desktop nav takes over.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && close();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lock page scroll while open.
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = open ? "hidden" : "";
    return () => {
      root.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
        className={`${ICON_BUTTON} lg:hidden`}
      >
        <span className="sr-only">Open menu</span>
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 20 14"
          className="h-3.5 w-5"
          fill="currentColor"
        >
          <rect width="20" height="2" />
          <rect y="6" width="14" height="2" />
          <rect y="12" width="20" height="2" />
        </svg>
      </button>

      <dialog
        ref={dialog}
        id={id}
        aria-label="Menu"
        onClose={() => setOpen(false)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto p-0 backdrop:bg-room/40 open:flex open:flex-col motion-safe:open:animate-menu-in bg-surface text-text bg-none"
      >
        {/* The dialog is in the top layer, above the page's grain. */}
        <div aria-hidden className="room-grain block" />
        {/* Same row geometry as the header, so the close button lands
            exactly where the menu button was. */}
        <div className="page-x flex items-center justify-between gap-6 min-h-20 py-4">
          <Logo />
          <button type="button" onClick={close} className={ICON_BUTTON}>
            <span className="sr-only">Close menu</span>
            <svg
              aria-hidden
              focusable="false"
              viewBox="0 0 16 16"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M2 2 14 14 M14 2 2 14" />
            </svg>
          </button>
        </div>

        <div className="page-x flex flex-1 flex-col gap-10 border-t pb-10 pt-8 border-line">
          <SectionLabel>Menu</SectionLabel>

          {links.length > 0 && (
            <nav aria-label="Main">
              <ul className="flex flex-col">
                {links.map((l) => (
                  <li key={l.href} className="border-b border-line">
                    <MenuLink href={l.href} current={pathname} onSame={close} big>
                      {l.label}
                    </MenuLink>
                    {l.children && l.children.length > 0 && (
                      <ul className="-mt-1 flex flex-col pb-3 pl-6">
                        {l.children.map((c) => (
                          <li key={c.href}>
                            <MenuLink href={c.href} current={pathname} onSame={close}>
                              {c.label}
                            </MenuLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {cta && (
            <Button href={cta.href} block onClick={close}>
              {cta.label}
            </Button>
          )}

          {(contact.phone || contact.email) && (
            <ul className={`mt-auto flex flex-col font-body text-room-small`}>
              {contact.phone && (
                <li>
                  <a
                    href={contact.phone.href}
                    className="inline-flex min-h-touch items-center gap-2 no-underline text-text"
                  >
                    {contact.phone.display}
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a
                    href={contact.email.href}
                    className="inline-flex min-h-touch items-center gap-2 no-underline text-text"
                  >
                    {contact.email.display}
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}

function MenuLink({
  href,
  current,
  onSame,
  big = false,
  children,
}: {
  href: string;
  current: string | null;
  onSame: () => void;
  big?: boolean;
  children: string;
}) {
  const isCurrent = current === href;
  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      // A link to the page you're on doesn't navigate, so close here.
      onClick={() => isCurrent && onSame()}
      className={
        big
          ? "flex items-center justify-between no-underline aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8 min-h-[52px] font-body text-[1.375rem] font-medium text-text aria-[current=page]:decoration-amber"
          : `inline-flex min-h-touch items-center no-underline font-body text-room-small text-muted aria-[current=page]:text-text`
      }
    >
      {children}
    </Link>
  );
}
