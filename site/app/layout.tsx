import type { Metadata } from "next";
import { Chakra_Petch, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { site } from "@/site.config";
import { IS_PREVIEW } from "@/lib/preview";
import { JsonLd } from "@/components/JsonLd";

/*
 * Fonts (PLAN §4.2). next/font downloads them at build time and serves
 * them from this origin, so font-src stays 'self' in scripts/csp.mjs
 * and no request goes to Google at runtime. It also writes the preload
 * links and size-adjusted fallbacks, which keeps CLS near zero.
 *
 * Only the weights the design uses are loaded (REFACTOR_AUDIT §3.2).
 */
const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
  // Labels are small and rarely above the fold's largest paint.
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
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
