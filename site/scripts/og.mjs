/**
 * ════════════════════════════════════════════════════════════════════
 *  Share images and touch icons, rendered at build (PLAN §8: "Open
 *  Graph images per page (generated, on-brand)").
 *
 *  Reads every built page in out/, takes its og:image path (set by
 *  lib/meta.ts ogImageFor) and og:title, and renders that PNG into
 *  out/og/. So a new page gets its image by existing; nothing to
 *  register. Also writes out/apple-touch-icon.png and out/favicon.ico
 *  (the SVG favicon is app/icon.svg).
 *
 *  Why not Next's opengraph-image routes: Next 14's bundled renderer
 *  loads its fallback font through a file URL that breaks on Windows,
 *  so local builds failed. satori (layout → SVG) and resvg (SVG → PNG)
 *  are the same two pieces, called directly. Fonts are TTF copies of the
 *  site's own self-hosted fonts (scripts/og-fonts, SIL OFL 1.1; satori
 *  can't read WOFF2).
 * ════════════════════════════════════════════════════════════════════
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const FONTS = join(ROOT, "scripts", "og-fonts");

const HEADLINE = "Websites that book the job.";

const C = {
  ice: "#E4EEF4",
  ink: "#0B0D10",
  steel: "#4A5560",
  signal: "#FF5A1F",
  frost: "#F4F8FB",
};

const fonts = [
  { name: "Chakra", data: readFileSync(join(FONTS, "chakra-petch-600.ttf")), weight: 600 },
  { name: "Chakra", data: readFileSync(join(FONTS, "chakra-petch-700.ttf")), weight: 700 },
  { name: "Mono", data: readFileSync(join(FONTS, "jetbrains-mono.ttf")), weight: 500 },
];

/* ── tiny element helper (satori takes React-shaped objects) ──────── */
const el = (type, style, children) => ({ type, props: { style, children } });

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const meta = (html, prop) =>
  html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`))?.[1];

/** "/og/services-web-design.png" → "SERVICES". */
function labelFor(slug) {
  if (slug === "home" || slug === "default") return "Web design · Local SEO — Acadiana, LA";
  return slug.split("-")[0].replace(/^\w/, (c) => c.toUpperCase());
}

function card({ title, label }) {
  // Long titles step down so they never overflow the frame.
  const size = title.length > 48 ? 64 : title.length > 28 ? 80 : 96;
  const abs = (style) => el("div", { position: "absolute", display: "flex", ...style }, []);
  return el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      position: "relative",
      background: C.ice,
      fontFamily: "Chakra",
    },
    [
      // Flare, as in the hero: lines first, so the content layer sits on top.
      abs({ left: 0, right: 0, top: 452, height: 2, background: C.signal }),
      // Stops above the wordmark row so it never runs through text.
      abs({ left: 860, top: 0, bottom: 130, width: 2, background: C.signal }),
      abs({
        left: 852,
        top: 444,
        width: 18,
        height: 18,
        borderRadius: 9,
        background: "#FFF4EC",
        boxShadow: `0 0 28px 10px ${C.signal}`,
      }),
      // Content layer: label top, title middle, wordmark bottom.
      el(
        "div",
        {
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
        },
        [
          el(
            "div",
            {
              display: "flex",
              fontFamily: "Mono",
              fontSize: 22,
              letterSpacing: 3,
              color: C.steel,
              textTransform: "uppercase",
            },
            `( ${label} )`
          ),
          el(
            "div",
            {
              display: "flex",
              maxWidth: 760,
              fontSize: size,
              fontWeight: 600,
              lineHeight: 0.95,
              color: C.ink,
              textTransform: "uppercase",
            },
            title
          ),
          el("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
            el("div", { display: "flex", alignItems: "center" }, [
              el(
                "div",
                { display: "flex", width: 22, height: 22, background: C.ink, marginRight: 16 },
                []
              ),
              el(
                "div",
                { display: "flex", fontWeight: 700, fontSize: 30, letterSpacing: 4, color: C.ink },
                "DIGITAL HAPTICS"
              ),
            ]),
            el(
              "div",
              { display: "flex", fontFamily: "Mono", fontSize: 22, letterSpacing: 2, color: C.ink },
              "digitalhaptics.dev"
            ),
          ]),
        ]
      ),
    ]
  );
}

function icon(size) {
  const inner = Math.round(size * 0.44);
  return el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: C.ink,
    },
    [el("div", { width: inner, height: inner, background: C.signal }, [])]
  );
}

async function png(node, width, height) {
  const svg = await satori(node, { width, height, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
}

/** An .ico holding PNG images (valid since Windows Vista; all browsers read it). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

export async function renderOg() {
  const jobs = new Map(); // slug → title
  for (const file of htmlFiles(OUT)) {
    const html = readFileSync(file, "utf8");
    const image = meta(html, "og:image");
    const title = meta(html, "og:title");
    const slug = image?.match(/\/og\/([a-z0-9-]+)\.png$/)?.[1];
    // Home and the default carry the hero headline (PLAN §5) rather than
    // the site title, which would repeat the wordmark under it.
    const text = slug === "home" || slug === "default" ? HEADLINE : title && decode(title);
    if (slug && text && !jobs.has(slug)) jobs.set(slug, text);
  }

  mkdirSync(join(OUT, "og"), { recursive: true });
  for (const [slug, title] of jobs) {
    writeFileSync(
      join(OUT, "og", `${slug}.png`),
      await png(card({ title, label: labelFor(slug) }), 1200, 630)
    );
  }

  writeFileSync(join(OUT, "apple-touch-icon.png"), await png(icon(180), 180, 180));
  writeFileSync(
    join(OUT, "favicon.ico"),
    ico([
      { size: 16, data: await png(icon(16), 16, 16) },
      { size: 32, data: await png(icon(32), 32, 32) },
      { size: 48, data: await png(icon(48), 48, 48) },
    ])
  );

  console.log(`[og] ${jobs.size} share images, apple-touch-icon, favicon.ico`);
  return true;
}

if (process.argv[1] && process.argv[1].endsWith("og.mjs")) {
  renderOg().catch((e) => {
    console.error("[og] failed:", e);
    process.exit(1);
  });
}
