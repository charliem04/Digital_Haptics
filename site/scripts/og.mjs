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
  room: "#12161A",
  text: "#EEF1EE",
  muted: "#A9B5B2",
  amber: "#F5A254",
};

const fonts = [
  { name: "Manrope", data: readFileSync(join(FONTS, "manrope-400.ttf")), weight: 400 },
  { name: "Manrope", data: readFileSync(join(FONTS, "manrope-500.ttf")), weight: 500 },
  { name: "Chakra", data: readFileSync(join(FONTS, "chakra-petch-700.ttf")), weight: 700 },
];

/**
 * The liquid, as a still: one mass from the site's colour ramp, fading
 * to the solid room before it reaches the text column.
 */
const LIQUID = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <radialGradient id="haze"><stop offset="0" stop-color="#1c4345"/><stop offset=".6" stop-color="#133236"/><stop offset="1" stop-color="#133236" stop-opacity="0"/></radialGradient>
      <radialGradient id="mass" cx=".56" cy=".6" r=".62"><stop offset="0" stop-color="#2b141a"/><stop offset=".2" stop-color="#871922"/><stop offset=".42" stop-color="#e22e20"/><stop offset=".6" stop-color="#f56c36"/><stop offset=".76" stop-color="#f5a254"/><stop offset=".86" stop-color="#987d57"/><stop offset=".94" stop-color="#415a54"/><stop offset="1" stop-color="#1c4345" stop-opacity="0"/></radialGradient>
      <linearGradient id="fade"><stop offset=".66" stop-color="${C.room}"/><stop offset=".78" stop-color="${C.room}" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="1200" height="630" fill="${C.room}"/>
    <ellipse cx="1010" cy="330" rx="430" ry="470" fill="url(#haze)"/>
    <ellipse cx="1030" cy="380" rx="250" ry="310" fill="url(#mass)" transform="rotate(14 1030 380)"/>
    <rect width="1200" height="630" fill="url(#fade)"/>
  </svg>`
).toString("base64")}`;

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

/** "services-web-design" → "Services". */
function labelFor(slug) {
  if (slug === "home" || slug === "default") return "Web design · Local SEO — Acadiana, LA";
  return slug.split("-")[0].replace(/^\w/, (c) => c.toUpperCase());
}

function card({ title, label }) {
  // Long titles step down so they never reach the liquid.
  const size = title.length > 48 ? 56 : title.length > 28 ? 68 : 84;
  return el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      position: "relative",
      background: C.room,
      fontFamily: "Manrope",
    },
    [
      {
        type: "img",
        props: {
          src: LIQUID,
          width: 1200,
          height: 630,
          style: { position: "absolute", left: 0, top: 0 },
        },
      },
      el(
        "div",
        {
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 660,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 0 64px 72px",
        },
        [
          el("div", { display: "flex", fontSize: 26, color: C.muted }, label),
          el(
            "div",
            {
              display: "flex",
              fontSize: size,
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: C.text,
            },
            title
          ),
          el("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
            el("div", { display: "flex", alignItems: "center" }, [
              el(
                "div",
                {
                  display: "flex",
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: C.amber,
                  marginRight: 14,
                },
                []
              ),
              el(
                "div",
                {
                  display: "flex",
                  fontFamily: "Chakra",
                  fontWeight: 700,
                  fontSize: 30,
                  color: C.text,
                },
                "Digital Haptics"
              ),
            ]),
            el("div", { display: "flex", fontSize: 24, color: C.muted }, "digitalhaptics.dev"),
          ]),
        ]
      ),
    ]
  );
}

function icon(size) {
  const inner = Math.round(size * 0.5);
  return el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: C.room,
    },
    [el("div", { width: inner, height: inner, borderRadius: inner / 2, background: C.amber }, [])]
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
