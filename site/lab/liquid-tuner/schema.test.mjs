import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { validateTuning } from "./schema.ts";
import { posterBackground } from "../../components/home/liquid/poster.ts";

const launch = () => JSON.parse(readFileSync(new URL("./launch.json", import.meta.url), "utf8"));

test("launch values are valid and unchanged", () => {
  assert.deepEqual(validateTuning(launch()), launch());
});

test("slider rounding noise is removed", () => {
  const input = launch();
  input.look.coverage = 0.4600000000000001;
  input.desktop.renderScale = 0.30000000000000004;
  assert.deepEqual(validateTuning(input), launch());
});

test("unknown keys are dropped", () => {
  const input = launch();
  input.extra = 1;
  input.look.extra = 1;
  assert.deepEqual(validateTuning(input), launch());
});

for (const [name, change] of [
  ["out-of-range look value", (t) => (t.look.coverage = 2)],
  ["missing look value", (t) => delete t.look.fogAmount],
  ["non-number", (t) => (t.look.flowSpeed = "fast")],
  ["NaN", (t) => (t.look.flowSpeed = NaN)],
  ["fractional seed", (t) => (t.look.seed = 1.5)],
  ["fractional blob count", (t) => (t.phone.blobCount = 4.5)],
  ["too many blobs", (t) => (t.desktop.blobCount = 17)],
  ["render scale too low", (t) => (t.phone.renderScale = 0.01)],
  ["bad colour", (t) => (t.ramp[3].color = "red")],
  ["moved ramp stop", (t) => (t.ramp[3].at = 0.5)],
  ["wrong stop count", (t) => t.ramp.pop()],
]) {
  test(`rejects ${name}`, () => {
    const input = launch();
    change(input);
    assert.throws(() => validateTuning(input));
  });
}

for (const input of [null, 1, "x", []]) {
  test(`rejects ${JSON.stringify(input)}`, () => {
    assert.throws(() => validateTuning(input));
  });
}

test("poster matches the original gradient with launch colours", () => {
  assert.equal(
    posterBackground(launch().ramp),
    "radial-gradient(var(--lw) var(--lh) at var(--lx) var(--ly), #871922 0%, #a81f20 22%, #e22e20 42%, #f56c36 58%, #f5a254 74%, #987d57 84%, #415a54 92%, transparent 100%), radial-gradient(calc(var(--lw) * 2.4) calc(var(--lh) * 2) at var(--lx) var(--ly), #1c4345 0%, #133236 55%, transparent 100%)"
  );
});

test("poster follows a changed colour", () => {
  const { ramp } = launch();
  ramp[7].color = "#00ff00";
  assert.match(posterBackground(ramp), /#00ff00 58%/);
});
