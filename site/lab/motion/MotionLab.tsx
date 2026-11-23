"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import s from "./motion.module.css";

type Category = "page" | "text" | "passive" | "divider";
type Option = { id: string; name: string; note: string };
type Picks = Record<Category, string>;

const CATEGORIES: { id: Category; title: string; lede: string; options: Option[] }[] = [
  {
    id: "page",
    title: "Page transitions",
    lede: "What happens between pages. Each one is kept under half a second so it never delays reading.",
    options: [
      { id: "fade", name: "A. Soft fade", note: "Quietest. The new page fades up a few pixels." },
      { id: "sheet", name: "B. Rising sheet", note: "The new page slides up over the old one." },
      { id: "molten", name: "C. Molten wipe", note: "A band of the liquid's colours sweeps past." },
      { id: "iris", name: "D. Iris open", note: "The new page opens from a growing circle." },
    ],
  },
  {
    id: "text",
    title: "Text animation",
    lede: "How section headings arrive on scroll. The home headline stays instant, because it is the page's speed score.",
    options: [
      { id: "line", name: "A. Line rise", note: "Each line lifts out from behind a mask." },
      { id: "words", name: "B. Word cascade", note: "Words land one after another." },
      {
        id: "sweep",
        name: "C. Light sweep",
        note: "Text is revealed by a soft left-to-right edge.",
      },
      {
        id: "underline",
        name: "D. Underline draw",
        note: "Text is readable at once, and an amber line draws under the key phrase.",
      },
    ],
  },
  {
    id: "passive",
    title: "Passive animation",
    lede: "Slow background life on sections, so they feel less flat. Always behind solid text areas.",
    options: [
      { id: "glow", name: "A. Heat glow", note: "A warm patch of light drifts slowly." },
      { id: "embers", name: "B. Rising embers", note: "A few small sparks float upward." },
      { id: "contours", name: "C. Drifting contours", note: "Thin survey-map lines flow past." },
      { id: "rim", name: "D. Rim light", note: "A highlight travels around the panel edge." },
    ],
  },
  {
    id: "divider",
    title: "Section dividers",
    lede: "How one section hands off to the next.",
    options: [
      { id: "draw", name: "A. Drawn line", note: "A hairline draws outward from the center." },
      { id: "seam", name: "B. Heat seam", note: "A pulse of amber runs along the line." },
      { id: "wave", name: "C. Liquid edge", note: "The section boundary moves like a surface." },
      { id: "drip", name: "D. Molten drip", note: "The upper section slowly drips into the next." },
    ],
  },
];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

function TextDemo({ id }: { id: string }) {
  if (id === "line") {
    return (
      <p className={s.demoHeading}>
        {["Websites that", "book the job."].map((line, i) => (
          <span key={line} className={s.lineMask}>
            <span className={s.lineInner} style={order(i)}>
              {line}
            </span>
          </span>
        ))}
      </p>
    );
  }
  if (id === "words") {
    return (
      <p className={s.demoHeading}>
        {"Websites that book the job.".split(" ").map((word, i) => (
          <span key={word} className={s.word} style={order(i)}>
            {word}{" "}
          </span>
        ))}
      </p>
    );
  }
  if (id === "sweep")
    return <p className={`${s.demoHeading} ${s.sweep}`}>Websites that book the job.</p>;
  return (
    <p className={s.demoHeading}>
      Websites that <span className={s.underline}>book the job.</span>
    </p>
  );
}

function PassiveDemo({ id }: { id: string }) {
  return (
    <div className={s.passive}>
      {id === "glow" && <span className={s.glow} />}
      {id === "embers" &&
        Array.from({ length: 12 }, (_, i) => <span key={i} className={s.ember} style={order(i)} />)}
      {id === "contours" && (
        <svg className={s.contours} viewBox="0 0 800 240" preserveAspectRatio="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d={`M0 ${30 + i * 26} C 130 ${i * 26}, 270 ${70 + i * 26}, 400 ${30 + i * 26} S 670 ${i * 26}, 800 ${30 + i * 26}`}
            />
          ))}
        </svg>
      )}
      {id === "rim" && <span className={s.rim} />}
      <div className={s.passiveCard}>Solid panel, readable text</div>
    </div>
  );
}

function DividerDemo({ id }: { id: string }) {
  return (
    <div className={s.dividerStage}>
      <div className={s.upper} />
      {id === "draw" && <span className={s.draw} />}
      {id === "seam" && (
        <span className={s.seamLine}>
          <span className={s.seam} />
        </span>
      )}
      {id === "wave" && (
        <svg className={s.wave} viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0 0H1200V24C1100 54 1000 54 900 24S700 -6 600 24 400 54 300 24 100 -6 0 24Z" />
        </svg>
      )}
      {id === "drip" && (
        <div className={s.drips}>
          {[34, 62, 22, 78, 40, 28, 56].map((h, i) => (
            <span key={i} style={{ ...order(i), height: h }} />
          ))}
        </div>
      )}
    </div>
  );
}

function MockPage({ index, children }: { index: number; children?: ReactNode }) {
  return (
    <div className={`${s.mockPage} ${index % 2 ? s.mockAlt : ""}`}>
      {children ?? (
        <>
          <strong>{index % 2 ? "Pricing" : "Services"}</strong>
          <span />
          <span />
        </>
      )}
    </div>
  );
}

function PageDemo({
  id,
  tick,
  render,
}: {
  id: string;
  tick: number;
  render?: (i: number) => ReactNode;
}) {
  return (
    <div className={s.pageStage} key={tick}>
      <div className={`${s.layer} ${s[`out-${id}`]}`}>
        <MockPage index={tick + 1}>{render?.(tick + 1)}</MockPage>
      </div>
      <div className={`${s.layer} ${s[`in-${id}`]}`}>
        <MockPage index={tick}>{render?.(tick)}</MockPage>
      </div>
      {id === "molten" && <span className={s.curtain} />}
    </div>
  );
}

function Demo({ category, id, tick }: { category: Category; id: string; tick: number }) {
  if (category === "page") return <PageDemo id={id} tick={tick} />;
  if (category === "passive") return <PassiveDemo id={id} />;
  return (
    <div key={tick} className={s.replay}>
      {category === "text" ? <TextDemo id={id} /> : <DividerDemo id={id} />}
    </div>
  );
}

export function MotionLab() {
  const [picks, setPicks] = useState<Picks>({
    page: "fade",
    text: "underline",
    passive: "glow",
    divider: "seam",
  });
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTick((t) => t + 1), 3600);
    return () => window.clearInterval(timer);
  }, [playing]);

  const summary = CATEGORIES.map((c) => {
    const option = c.options.find((o) => o.id === picks[c.id]);
    return `${c.title}: ${option?.name}`;
  }).join("\n");

  const copy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={s.lab}>
      <header className={s.intro}>
        <h1>Motion options</h1>
        <p>
          Choose one per row. The combined preview at the bottom updates with your picks. If your
          device has reduced motion turned on, these demos stay still.
        </p>
      </header>

      <div className={s.bar}>
        <span>
          {CATEGORIES.map((c) => (
            <b key={c.id}>{c.options.find((o) => o.id === picks[c.id])?.name}</b>
          ))}
        </span>
        <span className={s.barActions}>
          <button type="button" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={() => setTick((t) => t + 1)}>
            Replay
          </button>
          <button type="button" className={s.primary} onClick={copy}>
            {copied ? "Copied" : "Copy my picks"}
          </button>
        </span>
      </div>

      {CATEGORIES.map((category) => (
        <section key={category.id} className={s.category} aria-labelledby={`cat-${category.id}`}>
          <h2 id={`cat-${category.id}`}>{category.title}</h2>
          <p>{category.lede}</p>
          <div className={s.grid}>
            {category.options.map((option) => {
              const selected = picks[category.id] === option.id;
              return (
                <article key={option.id} className={`${s.card} ${selected ? s.selected : ""}`}>
                  <div className={s.stage} aria-hidden="true">
                    <Demo category={category.id} id={option.id} tick={tick} />
                  </div>
                  <h3>{option.name}</h3>
                  <p>{option.note}</p>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPicks((p) => ({ ...p, [category.id]: option.id }))}
                  >
                    {selected ? "Selected" : "Choose"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <section className={s.category} aria-labelledby="together">
        <h2 id="together">All four together</h2>
        <p>Your current picks, combined on a sample page.</p>
        <div className={s.together} aria-hidden="true">
          <PageDemo
            id={picks.page}
            tick={tick}
            render={(i) => (
              <div className={s.togetherPage}>
                <PassiveDemo id={picks.passive} />
                <div className={s.togetherText}>
                  <small>{i % 2 ? "Pricing" : "Services"}</small>
                  <TextDemo id={picks.text} />
                </div>
                <DividerDemo id={picks.divider} />
              </div>
            )}
          />
        </div>
      </section>
    </div>
  );
}
