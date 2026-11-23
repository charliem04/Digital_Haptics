/**
 * The CSS poster shown before the canvas, built from the saved colour
 * ramp so a retuned palette cannot flash the old colours.
 */

type Stop = { color: string };

/** How far the poster's deep red sits from crimson towards red, per channel. */
const DEEP_RED_MIX = [0.363, 0.286, 1];

const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);

function deepRed(crimson: string, red: string): string {
  const parts = DEEP_RED_MIX.map((mix, i) => {
    const from = channel(crimson, i);
    const value = Math.round(from + (channel(red, i) - from) * mix);
    return value.toString(16).padStart(2, "0");
  });
  return `#${parts.join("")}`;
}

export function posterBackground(ramp: readonly Stop[]): string {
  const [, deepTeal, teal, sage, tan, hotRim, , orange, red, crimson] = ramp.map((s) => s.color);
  return (
    `radial-gradient(var(--lw) var(--lh) at var(--lx) var(--ly), ${crimson} 0%, ` +
    `${deepRed(crimson, red)} 22%, ${red} 42%, ${orange} 58%, ${hotRim} 74%, ${tan} 84%, ` +
    `${sage} 92%, transparent 100%), ` +
    `radial-gradient(calc(var(--lw) * 2.4) calc(var(--lh) * 2) at var(--lx) var(--ly), ` +
    `${teal} 0%, ${deepTeal} 55%, transparent 100%)`
  );
}
