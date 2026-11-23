# Liquid tuner: short design

## Why

The owner wants to tune the homepage liquid animation by eye and keep the result, without asking Claude to change values.

## Goals

- A local page at `/lab/liquid` with live controls for the real homepage engine.
- **Save** stores the values so the next deploy ships them.
- Separate desktop and phone previews.

## Non-goals

- No online editor, login or publishing without a deploy.
- No changes to the simulation's internal constants, such as wall strength or drag. Only the existing settings are exposed.

## Anti-goals

- Visitors must not download any tuner code.
- With unchanged values, the homepage must look and perform as it does now.

## Approaches

1. **Local page that saves to the repo (chosen by the owner).** No production cost, and changes go through the normal deploy.
2. **Online page with a login.** Tunable from anywhere, but needs authentication and storage, and adds a settings fetch to the homepage.

## Design

**Saved values.** The tunable values move from `components/home/liquid/params.ts` into `components/home/liquid/tuning.json`. `params.ts` imports that file and keeps its existing exports, so the production code path stays the same. Save only ever rewrites this data file, never TypeScript.

**Controls**, using the tweakpane dependency the lab already has:

| Group | Settings |
| --- | --- |
| Form | blob count (desktop, phone), coverage, viscosity, stretch, warp amount, warp scale, seed |
| Motion | flow speed, gravity, buoyancy, camera drift, pause |
| Look | rim width, depth of field, fog |
| Grain | amount, size, frames per second |
| Quality | render scale (desktop, phone) |
| Colours | the 11 colour ramp stops |

**Preview.** The real `LiquidEngine` fills the stage, with a toggle for the actual hero layout on top so the composition can be judged against the headline. A desktop/phone switch sizes the stage and applies that device's settings. A frame-rate readout shows the cost of the current values.

**Engine.** `LiquidEngine` gains a method to apply new values while running. Most apply instantly. Colours rebuild the ramp. Seed and blob count restart the arrangement. The tuner runs its own loop without the homepage's performance step-down, so quality never changes silently during tuning.

**Actions.** Save, Revert to last saved, and Restore launch values (today's values). An indicator shows unsaved changes, and the browser warns before leaving with any.

**Saving.** A dev-only endpoint validates each value against its slider range and writes `tuning.json`. It does not exist in production builds.

**Poster.** The static first-paint gradient in `LiquidBackdrop` is built from the saved colours, so it cannot drift from a retuned palette. With today's colours it must render the same gradient.

## Left to the builder

- The site uses `output: "export"`, which may block a save endpoint under `next dev`. If it does, apply that option only to production builds.
- Slider ranges start from the lab panel's ranges.

## Done when

- Every control visibly changes the live preview.
- A saved value survives a reload and appears on the homepage under `npm run dev`.
- `npm run build` succeeds, and `out/` contains no tuner page or tuner code.
- Typecheck and lint pass.
