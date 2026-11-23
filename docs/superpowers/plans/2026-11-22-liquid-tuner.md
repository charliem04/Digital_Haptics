# Liquid Tuner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A dev-only `/lab/liquid` page that tunes the real homepage liquid engine live and saves to the repo.

**Architecture:** Tunable values move to `tuning.json`, read by `params.ts`. The tuner page holds the controls and drives a same-origin iframe (`/lab/liquid/stage/`) by `postMessage`. The iframe renders the real header and hero at true device width, so breakpoints are correct.

**Tech Stack:** Next 14 static export, plain WebGL2, tweakpane (existing dev dependency), `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-22-liquid-tuner-design.md`

## Global Constraints

- All tuner routes use the `.lab.tsx` extension, so they do not exist in `next build`.
- With unchanged values, the homepage renders the same, including the exact poster gradient.
- Do not commit. The owner has not asked for commits.

## Review Focus

- Malformed or out-of-range save payload: rejected, and `tuning.json` is untouched.
- A cross-site page posting to the local dev server: rejected by an Origin check.
- A saved render scale below the step-down scale: the governor must never raise quality.
- Saving triggers hot reload: the tuner keeps its values and the preview recovers.
- No usable GPU in the preview: the page says so instead of showing a blank stage.

---

### Task 1: Saved values, validation and poster

**Files:**
- Create: `site/components/home/liquid/tuning.json`, `site/components/home/liquid/poster.ts`, `site/lab/liquid-tuner/schema.ts`, `site/lab/liquid-tuner/launch.json`
- Modify: `site/components/home/liquid/params.ts`, `site/components/home/liquid/LiquidBackdrop.tsx`
- Test: `site/lab/liquid-tuner/schema.test.mjs`

**Interfaces:**
- Produces: `validateTuning(input: unknown): Tuning` (throws on bad input), `LOOK_RANGES`, `DEVICE_RANGES`, `STOP_NAMES`, `posterBackground(ramp): string`.

- [ ] Write tests: launch values validate; unknown keys are dropped; out-of-range, non-integer, bad hex and wrong stop count throw; poster output equals today's exact string.
- [ ] Run `node --experimental-strip-types --no-warnings --test lab/liquid-tuner/schema.test.mjs`. Expected: FAIL, modules missing.
- [ ] Implement, and point `params.ts` and the poster at the saved values.
- [ ] Re-run. Expected: PASS.

### Task 2: Engine retuning

**Files:** Modify `site/components/home/liquid/engine.ts`, `site/components/home/liquid/runLiquid.ts`, `site/components/home/Hero.tsx`

**Interfaces:**
- Produces: `LiquidEngine.retune({ look, settings, ramp }): void`; `Hero({ backdrop })`, defaulting to `<LiquidBackdrop />`.

- [ ] Add `retune`. Seed or blob count changes reset the arrangement; a ramp change rebuilds the texture; a scale change lays out the scene.
- [ ] Governor uses `Math.min(STEP_DOWN_SCALE, settings.renderScale)`.
- [ ] Run `npm run typecheck`. Expected: pass.

### Task 3: Tuner page, stage and save

**Files:**
- Create: `site/app/lab/liquid/page.lab.tsx`, `site/app/lab/liquid/stage/page.lab.tsx`, `site/app/lab/liquid/save/route.lab.tsx`, `site/lab/liquid-tuner/Tuner.tsx`, `site/lab/liquid-tuner/Stage.tsx`
- Possibly modify: `site/next.config.mjs` (only if static export blocks the save route under `next dev`)

- [ ] Build the stage, the panel and the save route (JSON only, same-origin only, validated).
- [ ] Verify in the browser: controls change the preview, device switch, hero toggle, save, revert, restore.
- [ ] Verify a rejected save leaves `tuning.json` unchanged.

### Task 4: Final checks

- [ ] Restore `tuning.json` to launch values after testing.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm test`, the schema test and `npm run build`.
- [ ] Confirm `out/` contains no `lab` route or tuner code.
