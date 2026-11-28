import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./motion.css";
import { site } from "@/site.config";
import { motionConfig } from "@/motion.config";
import { MotionRuntime } from "@/components/motion/MotionRuntime";
import { PageTransition } from "@/components/motion/PageTransition";
import { IS_PREVIEW } from "@/lib/preview";
import { JsonLd } from "@/components/JsonLd";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCta } from "@/components/layout/StickyCta";
import { ctaLink } from "@/lib/nav";
import { CTA_HREF } from "@/lib/routes";
import { InteractionTracking } from "@/components/InteractionTracking";
import { DevTransitionPicker } from "@/lib/dev";
import { PerfProbe } from "@/components/perf/PerfProbe";

/*
 * Fonts (docs/VISUAL_GUIDE.md §3), committed in app/fonts/ and loaded
 * with next/font/local: Manrope for all text, Chakra Petch 700 for the
 * logo.
 *
 * Why local rather than next/font/google: Next 14's Google loader
 * crashes the build when Google Fonts returns an unexpected response,
 * which happened in 2 of 5 Phase 0 builds. Committed files make every
 * build deterministic and need no network. The runtime result is the
 * same: files served from this origin (font-src 'self' in
 * scripts/csp.mjs), preload links, and size-adjusted fallbacks.
 *
 * Files are Google Fonts' latin subsets. Both families are SIL OFL 1.1;
 * the licenses sit beside the files.
 */
const display = localFont({
  src: [{ path: "./fonts/chakra-petch-700.woff2", weight: "700", style: "normal" }],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const body = localFont({
  src: [{ path: "./fonts/manrope-variable.woff2", weight: "400 500", style: "normal" }],
  variable: "--font-body",
  display: "swap",
  // Matched per weight in globals.css. The automatic fallback set Manrope
  // too narrow, so lines re-wrapped and moved the page when it loaded.
  adjustFontFallback: false,
  fallback: ["Manrope Fallback", "system-ui", "sans-serif"],
});

/** Browser chrome and native controls match the dark room. */
export const viewport: Viewport = {
  themeColor: "#12161A",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  // Preview deploys are never indexed (also robots.txt + X-Robots-Tag).
  ...(IS_PREVIEW ? { robots: { index: false, follow: false } } : {}),
  title: {
    default: site.seo.defaultTitle,
    template: site.seo.titleTemplate,
  },
  description: site.seo.defaultDescription,
  alternates: { canonical: site.url },
  openGraph: {
    title: site.seo.defaultTitle,
    description: site.seo.defaultDescription,
    url: site.url,
    siteName: site.name,
    images: [{ url: site.seo.ogImage, width: 1200, height: 630 }],
    type: "website",
  },
};

/**
 * Root layout: the shell every page gets (PLAN §9 Phase 2). Skip link,
 * header with mobile menu, <main>, footer, mobile sticky CTA. Mounted
 * here so no page can ship without them.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      data-motion-page={motionConfig.page}
      data-motion-text={motionConfig.text}
      data-motion-widget={motionConfig.widget}
      data-motion-hover={motionConfig.hover}
    >
      <body className="flex min-h-dvh flex-col">
        {/*
          Framer serialises each entrance's starting state into the HTML
          as style="opacity:0". With JavaScript off or failed, that would
          leave content permanently invisible, so this un-hides it.
          dangerouslySetInnerHTML because <style> is raw text: React
          would escape the quotes and the selector would never match.
          The content is a literal with nothing interpolated.
        */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `[style*="opacity:0"]{opacity:1!important;transform:none!important}[data-sticky-waiting]{visibility:visible!important;transform:none!important}[data-menu-button]{display:none!important}`,
            }}
          />
        </noscript>
        <SkipLink />
        <Header />
        {/* tabIndex -1: the skip link's target must take focus. No ring: it's
            the whole page, focused only by the skip link. deliberate-ignore outline-none
            overflow-x clip: nothing that slides in from the side (the case
            study phone shot) can widen the page on a phone. Clip, not
            hidden, so it stays no scroll container and sticky still works. */}
        <main
          id="main"
          tabIndex={-1}
          // deliberate-ignore outline-none
          className="flex-1 [overflow-x:clip] focus:shadow-none focus:outline-none"
        >
          {children}
        </main>
        <Footer />
        <StickyCta cta={ctaLink()} />
        <InteractionTracking ctaHref={CTA_HREF} />
        <PageTransition />
        {/* Dev only: try the page transitions live. Never in a build. */}
        {DevTransitionPicker && <DevTransitionPicker />}
        <MotionRuntime />
        {/* Perf branch: does nothing without ?perf in the URL (lib/perf.ts). */}
        <PerfProbe />
        <JsonLd />
      </body>
    </html>
  );
}
