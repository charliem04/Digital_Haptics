"use client";

import { useEffect, useState } from "react";
import { TerrainDemo } from "./TerrainDemo";
import css from "./lab.module.css";

type Bench = "terrain" | "feet" | null;

/**
 * /lab — both hero backgrounds with their control panels.
 *
 * `?bench=terrain` or `?bench=feet` shows one concept alone at a fixed
 * 2560×1440 with the device pixel ratio forced to 1, and runs the bench
 * once it is up.
 */
export function Lab() {
  const [bench, setBench] = useState<Bench | undefined>(undefined);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("bench");
    setBench(q === "terrain" || q === "feet" ? q : null);
  }, []);

  return (
    <div className={css.lab}>
      <header className={css.intro}>
        <p className={css.kicker}>Lab · dev only · not in production builds</p>
        <h1 className={css.title}>Hero motion</h1>
        <p>
          Two interchangeable real-time backgrounds. Both fill whatever container they are put in,
          stop when they are offscreen or the tab is hidden, and hold one still frame under reduced
          motion. Pick one; nothing here is wired into the live hero.
        </p>
        <p className={css.kicker}>
          Bench at 2560 × 1440: <a href="?bench=terrain">terrain</a> ·{" "}
          <a href="?bench=feet">feet</a> · <a href="?">both, normal</a>
        </p>
      </header>

      {bench !== undefined && bench !== "feet" && <TerrainDemo bench={bench === "terrain"} />}
    </div>
  );
}
