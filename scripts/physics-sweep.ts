import { DEFAULT_SETTINGS, FLOOR_Y, RAMP_TRANSITION_RUN } from "../src/lib/simulator/constants";
import { getBallRadius, getRampPoints } from "../src/lib/simulator/geometry";
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

function assertAtMost(label: string, actual: number, expected: number) {
  if (actual > expected) {
    throw new Error(`${label} spread was ${actual}px; expected at most ${expected}px`);
  }
}

function assertEqual(label: string, values: number[]) {
  const unique = new Set(values);

  if (unique.size !== 1) {
    throw new Error(`${label} changed outcomes unexpectedly: ${values.join(", ")}`);
  }
}

function assertClose(label: string, actual: number, expected: number, tolerance: number) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label} was ${actual}; expected ${expected} +/- ${tolerance}`);
  }
}

const heightSpread = spread([
  { label: "low", settings: { rampHeight: 1 } },
  { label: "high", settings: { rampHeight: 10 } },
]);
const lengthSpread = spread([
  { label: "short", settings: { rampLength: 1 } },
  { label: "long", settings: { rampLength: 10 } },
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
const defaultRoll = simulateRoll(DEFAULT_SETTINGS, "regression");
const defaultRamp = getRampPoints(DEFAULT_SETTINGS);
const transitionFrames = defaultRoll.frames.filter(
  (frame) => frame.x >= defaultRamp.end.x && frame.x <= defaultRamp.end.x + RAMP_TRANSITION_RUN,
);
const transitionXSpread =
  Math.max(...transitionFrames.map((frame) => frame.x)) - Math.min(...transitionFrames.map((frame) => frame.x));
const shallowRamp = getRampPoints({ rampHeight: 1, rampLength: 10 });
const shallowDrawnAngle = Math.atan2(
  shallowRamp.end.y - shallowRamp.start.y,
  shallowRamp.end.x - shallowRamp.start.x,
);
const cubeRoll = simulateRoll({ ...DEFAULT_SETTINGS, shape: "cube" }, "regression");
const cubeFinal = cubeRoll.frames.at(-1);
const cubeHalfSide = (getBallRadius(DEFAULT_SETTINGS) * 1.65) / 2;

assertAtLeast("ramp height", heightSpread, 90);
assertAtMost("ramp length", lengthSpread, 45);
assertAtLeast("ball size", sizeSpread, 50);
assertAtLeast("ball weight", weightSpread, 90);
assertAtLeast("texture", textureSpread, 90);
assertAtLeast("shape", shapeSpread, 180);
assertEqual("color", colorLandings);
assertClose("initial speed", defaultRoll.frames[0]?.speed ?? -1, 0, 0.000001);
assertClose("initial time", defaultRoll.frames[0]?.t ?? -1, 0, 0.000001);
assertClose("shallow ramp angle", shallowRamp.angle, shallowDrawnAngle, 0.000001);
assertAtLeast("ramp transition x travel", Math.round(transitionXSpread), Math.round(RAMP_TRANSITION_RUN * 0.7));

if (!cubeFinal) {
  throw new Error("cube roll produced no frames");
}

assertClose("cube settled angle", cubeFinal.angle % (Math.PI / 2), 0, 0.000001);
assertClose("cube floor contact", cubeFinal.y, FLOOR_Y - cubeHalfSide, 0.000001);

console.log("Physics sweep passed", {
  heightSpread,
  lengthSpread,
  sizeSpread,
  weightSpread,
  textureSpread,
  shapeSpread,
  colorLanding: colorLandings[0],
  transitionXSpread: Math.round(transitionXSpread),
});
