import { DEFAULT_SETTINGS } from "../src/lib/simulator/constants";
import { simulateRoll } from "../src/lib/simulator/physics";
import type { ExperimentSettings } from "../src/lib/simulator/types";

type Variant = {
  label: string;
  settings: Partial<ExperimentSettings>;
};

function landingFor(settings: Partial<ExperimentSettings>) {
  return Math.round(simulateRoll({ ...DEFAULT_SETTINGS, ...settings }, "regression").landingX);
}

function spread(variants: Variant[]) {
  const landings = variants.map((variant) => landingFor(variant.settings));
  return Math.max(...landings) - Math.min(...landings);
}

function assertAtLeast(label: string, actual: number, expected: number) {
  if (actual < expected) {
    throw new Error(`${label} spread was ${actual}px; expected at least ${expected}px`);
  }
}

function assertEqual(label: string, values: number[]) {
  const unique = new Set(values);

  if (unique.size !== 1) {
    throw new Error(`${label} changed outcomes unexpectedly: ${values.join(", ")}`);
  }
}

const heightSpread = spread([
  { label: "low", settings: { rampHeight: 1 } },
  { label: "high", settings: { rampHeight: 10 } },
]);
const sizeSpread = spread([
  { label: "small", settings: { ballSize: 1 } },
  { label: "large", settings: { ballSize: 10 } },
]);
const weightSpread = spread([
  { label: "light", settings: { ballWeight: 1 } },
  { label: "heavy", settings: { ballWeight: 10 } },
]);
const textureSpread = spread([
  { label: "smooth", settings: { texture: "smooth" } },
  { label: "gravel", settings: { texture: "gravel" } },
]);
const shapeSpread = spread([
  { label: "sphere", settings: { shape: "sphere" } },
  { label: "cube", settings: { shape: "cube" } },
  { label: "egg", settings: { shape: "egg" } },
]);
const colorLandings = (["teal", "coral", "gold", "violet", "ink"] as const).map((color) =>
  landingFor({ color }),
);

assertAtLeast("ramp height", heightSpread, 90);
assertAtLeast("ball size", sizeSpread, 50);
assertAtLeast("ball weight", weightSpread, 90);
assertAtLeast("texture", textureSpread, 90);
assertAtLeast("shape", shapeSpread, 180);
assertEqual("color", colorLandings);

console.log("Physics sweep passed", {
  heightSpread,
  sizeSpread,
  weightSpread,
  textureSpread,
  shapeSpread,
  colorLanding: colorLandings[0],
});
