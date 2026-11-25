"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { ContactLinks, NavLink } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Arrow";

/**
 * ════════════════════════════════════════════════════════════════════
 *  MOBILE MENU (PLAN §4.5): 48px menu button → a glass sheet.
 *
 *  A floating squircle of dark frosted glass (the same glass as the
 *  panes), with the page blurred behind it. On phones it spans the
 *  screen width under the header; on tablets it drops down under the
 *  button like a menu. The sheet drops in, then its rows cascade in.
 *  Numbered links with round arrows, service sub-links as chips, the
 *  CTA, then call and email rows. A tap outside the sheet closes it.
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
  const button = useRef<HTMLButtonElement>(null);
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
        ref={button}
        data-menu-button
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

      <noscript>
        <a
          href="#site-footer"
          className="flex h-12 items-center rounded-control border border-line bg-surface px-4 font-body text-room-small no-underline text-text lg:hidden"
        >
          Menu
        </a>
      </noscript>

      <dialog
        ref={dialog}
        id={id}
        aria-label="Menu"
        onClose={() => {
          setOpen(false);
          // Back to the menu button, however the menu was opened.
          button.current?.focus();
        }}
        // A tap on the blurred page around the sheet closes the menu.
        onClick={(e) => e.target === e.currentTarget && close()}
        className="menu-dialog fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-transparent p-0 text-text backdrop:bg-transparent open:block"
      >
        <div className="menu-sheet mx-3 mt-3 flex flex-col gap-6 rounded-panel border border-text/[0.12] p-5 sm:ml-auto sm:mr-6 sm:mt-4 sm:max-w-[440px]">
          {/* Same height as the header row, so the close button lands
              where the menu button was. */}
          <div className="flex items-center justify-between gap-6">
            <Logo className="whitespace-nowrap" />
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

          {links.length > 0 && (
            <nav aria-label="Main">
              <ul className="flex flex-col">
                {links.map((l, i) => (
                  <li
                    key={l.href}
                    className="menu-item border-t border-line"
                    style={{ "--i": i } as CSSProperties}
                  >
                    <MenuLink href={l.href} current={pathname} onSame={close} index={i}>
                      {l.label}
                    </MenuLink>
                    {l.children && l.children.length > 0 && (
                      <ul className="flex flex-wrap gap-2 pb-4 pl-10">
                        {l.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              aria-current={pathname === c.href ? "page" : undefined}
                              onClick={() => pathname === c.href && close()}
                              className="inline-flex min-h-touch items-center rounded-control border border-line px-4 font-body text-room-small text-muted no-underline transition-colors duration-[160ms] hover:border-text hover:text-text aria-[current=page]:border-text aria-[current=page]:text-text"
                            >
                              {c.label}
                            </Link>
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
            <div className="menu-item" style={{ "--i": links.length } as CSSProperties}>
              <Button href={cta.href} block onClick={close}>
                {cta.label}
              </Button>
            </div>
          )}

          {(contact.phone || contact.email) && (
            <ul
              className="menu-item grid gap-2"
              style={{ "--i": links.length + 1 } as CSSProperties}
            >
              {contact.phone && (
                <li>
                  <a href={contact.phone.href} className={CONTACT_ROW}>
                    <svg
                      aria-hidden
                      focusable="false"
                      viewBox="0 0 16 16"
                      className="size-4 shrink-0 text-amber"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinejoin="round"
                    >
                      <path d="M3.5 1.8h2.2l1.1 3-1.5 1a8.5 8.5 0 0 0 4.9 4.9l1-1.5 3 1.1v2.2a1.5 1.5 0 0 1-1.6 1.5A12.4 12.4 0 0 1 2 3.4a1.5 1.5 0 0 1 1.5-1.6Z" />
                    </svg>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-room-caption text-muted">Call</span>
                      <span className="truncate">{contact.phone.display}</span>
                    </span>
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a href={contact.email.href} className={CONTACT_ROW}>
                    <svg
                      aria-hidden
                      focusable="false"
                      viewBox="0 0 16 16"
                      className="size-4 shrink-0 text-amber"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinejoin="round"
                    >
                      <rect x="1.8" y="3.2" width="12.4" height="9.6" rx="1.6" />
                      <path d="m2.4 4 5.6 4.6L13.6 4" />
                    </svg>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-room-caption text-muted">Email</span>
                      <span className="truncate">{contact.email.display}</span>
                    </span>
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

const CONTACT_ROW =
  "flex min-h-[56px] items-center gap-3 rounded-field border border-line px-4 py-2 font-body text-room-small text-text no-underline transition-colors duration-[160ms] hover:border-text";

function MenuLink({
  href,
  current,
  onSame,
  index,
  children,
}: {
  href: string;
  current: string | null;
  onSame: () => void;
  index: number;
  children: string;
}) {
  const isCurrent = current === href;
  // The section is lit on its sub-pages too (/services/ on /services/x/).
  const inSection = isCurrent || (href !== "/" && !!current?.startsWith(href));
  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      // A link to the page you're on doesn't navigate, so close here.
      onClick={() => isCurrent && onSame()}
      data-section={inSection ? "" : undefined}
      className="group flex min-h-[64px] items-center gap-4 py-2 font-body text-text no-underline"
    >
      <span className="w-6 font-body text-room-caption text-muted group-data-[section]:text-amber">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="flex-1 text-[1.75rem] font-medium leading-tight tracking-[-0.01em]">
        {children}
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover:border-text group-data-[section]:border-amber group-data-[section]:bg-amber group-data-[section]:text-on-amber">
        <Arrow className="size-3.5" />
      </span>
    </Link>
  );
}
