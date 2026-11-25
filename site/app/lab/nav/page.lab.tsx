import type { Metadata } from "next";
import { ctaLink, headerLinks } from "@/lib/nav";
import { Hero } from "@/components/home/Hero";
import { LiquidBackdrop } from "@/components/home/liquid/LiquidBackdrop";
import { NavLab } from "./NavLab";

/**
 * /lab/nav: header and hero-frame options over the real hero.
 * DEV ONLY (`.lab.tsx`), never built into the site.
 *
 * The hero is a server component, so both frames are rendered here and
 * the client lab only picks which one shows.
 */
export const metadata: Metadata = {
  title: "Lab: nav and hero options",
  robots: { index: false, follow: false },
};

export default function NavLabPage() {
  return (
    <NavLab
      links={headerLinks()}
      cta={ctaLink()}
      bleed={<Hero />}
      window={
        <Hero
          backdrop={
            <>
              <LiquidBackdrop />
              {/* A squircle hole onto the liquid: its huge shadow is the room.
                  Its top margin comes from the lab (--win-top). */}
              <div
                aria-hidden
                className="liquid-cutout !absolute inset-x-[20px] bottom-[20px] top-[var(--win-top,0px)] lg:inset-x-[32px] lg:bottom-[32px]"
              />
            </>
          }
        />
      }
    />
  );
}
