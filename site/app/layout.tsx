import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/site.config";
import { IS_PREVIEW } from "@/lib/preview";
import { JsonLd } from "@/components/JsonLd";

/*
 * Fonts (PLAN §4.2), committed in app/fonts/ and loaded with
 * next/font/local.
 *
 * Why local rather than next/font/google: Next 14's Google loader
 * crashes the build when Google Fonts returns an unexpected response,
 * which happened in 2 of 5 Phase 0 builds. Committed files make every
 * build deterministic and need no network. The runtime result is the
 * same: files served from this origin (font-src 'self' in
 * scripts/csp.mjs), preload links, and size-adjusted fallbacks that
 * keep CLS near zero.
 *
 * Files are Google Fonts' latin subsets, downloaded 2026-11-02. All
 * three families are SIL OFL 1.1; the licenses sit beside the files.
 * Only the weights the design uses ship (REFACTOR_AUDIT §3.2).
 * Manrope and JetBrains Mono are variable fonts: one file covers both
 * weights.
 */
const display = localFont({
  src: [
    { path: "./fonts/chakra-petch-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/chakra-petch-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const body = localFont({
  src: [{ path: "./fonts/manrope-variable.woff2", weight: "400 500", style: "normal" }],
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const mono = localFont({
  src: [{ path: "./fonts/jetbrains-mono-variable.woff2", weight: "400 500", style: "normal" }],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
  // Labels are small and rarely the largest paint above the fold.
  preload: false,
});

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
 * Root layout. The header, mobile menu, footer and mobile sticky CTA
 * mount here in Phase 2, so no page can ship without them.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
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
              __html: `[style*="opacity:0"]{opacity:1!important;transform:none!important}`,
            }}
          />
        </noscript>
        <main>{children}</main>
        <JsonLd />
      </body>
    </html>
  );
}
