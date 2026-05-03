import {
  FLOOR_Y,
  PREDICTION_MAX_X,
  PREDICTION_MIN_X,
  RAMP_TRANSITION_RUN,
  TEXTURES,
} from "./constants";
import { clamp, getBallRadius, getBallStart, getRampPoints, normalize } from "./geometry";
import { mulberry32, seedFromSettings } from "./random";
import type { ExperimentSettings, MotionFrame, SimulationResult } from "./types";

const STEP_MS = 1000 / 60;
const STEP_SECONDS = STEP_MS / 1000;
const MAX_STEPS = 900;
const PIXELS_PER_METER = 260;
const GRAVITY = 9.81;
const AIR_DENSITY = 1.225;

type ShapePhysics = {
  inertiaRatio: number;
  dragCoefficient: number;
  rampEfficiency: number;
  landingEfficiency: number;
  floorLossMultiplier: number;
  wobble: number;
};

const SHAPE_PHYSICS: Record<ExperimentSettings["shape"], ShapePhysics> = {
  sphere: {
    inertiaRatio: 0.4,
    dragCoefficient: 0.47,
    rampEfficiency: 1,
    landingEfficiency: 0.86,
    floorLossMultiplier: 1,
    wobble: 0,
  },
  cylinder: {
    inertiaRatio: 0.5,
    dragCoefficient: 0.82,
    rampEfficiency: 0.96,
    landingEfficiency: 0.82,
    floorLossMultiplier: 1.18,
    wobble: 0,
  },
  cube: {
    inertiaRatio: 0.82,
    dragCoefficient: 1.05,
    rampEfficiency: 0.72,
    landingEfficiency: 0.55,
    floorLossMultiplier: 4.2,
    wobble: 0.45,
  },
  egg: {
    inertiaRatio: 0.56,
    dragCoefficient: 0.62,
    rampEfficiency: 0.86,
    landingEfficiency: 0.78,
    floorLossMultiplier: 2.15,
    wobble: 0.34,
  },
};

function getTextureCrr(settings: Pick<ExperimentSettings, "texture">) {
  const texture = TEXTURES.find((candidate) => candidate.id === settings.texture);
  const base = texture?.friction ?? 0.02;

  return {
    smooth: 0.018,
    rubber: 0.032,
    felt: 0.052,
    gravel: 0.082,
  }[settings.texture] ?? base;
}

function getFloorCrr(settings: Pick<ExperimentSettings, "texture">) {
  return {
    smooth: 0.12,
    rubber: 0.165,
    felt: 0.235,
    gravel: 0.34,
  }[settings.texture];
}

function getMassKg(settings: Pick<ExperimentSettings, "ballWeight">) {
  return 0.045 + normalize(settings.ballWeight, 1, 10) * 0.405;
}

function getRadiusMeters(radiusPx: number) {
  return radiusPx / PIXELS_PER_METER;
}

function dragAcceleration(speed: number, settings: ExperimentSettings, radiusMeters: number) {
  if (speed <= 0) {
    return 0;
  }

  const shape = SHAPE_PHYSICS[settings.shape];
  const area = Math.PI * radiusMeters ** 2;
  return (0.5 * AIR_DENSITY * shape.dragCoefficient * area * speed ** 2) / getMassKg(settings);
}

function makeFrame(x: number, y: number, angle: number, speed: number, t: number): MotionFrame {
  return {
    x,
    y,
    angle,
    speed,
    t,
  };
}

function settleAngle(settings: ExperimentSettings, angle: number) {
  if (settings.shape === "cube") {
    return Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
  }

  if (settings.shape === "egg") {
    return Math.round((angle - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2;
  }

  return angle;
}

function getContactSupportPx(settings: ExperimentSettings, radiusPx: number, angle: number) {
  if (settings.shape === "cube") {
    const halfSide = (radiusPx * 1.65) / 2;
    return halfSide * (Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle)));
  }

  if (settings.shape === "egg") {
    const radiusX = radiusPx * 0.78;
    const radiusY = radiusPx * 1.18;
    return Math.hypot(radiusX * Math.sin(angle), radiusY * Math.cos(angle));
  }

  return radiusPx;
}

function getFloorContactY(settings: ExperimentSettings, radiusPx: number, angle: number) {
  return FLOOR_Y - getContactSupportPx(settings, radiusPx, angle);
}

function pushFrame(frames: MotionFrame[], x: number, y: number, angle: number, speed: number) {
  frames.push(makeFrame(x, y, angle, speed, frames.length * STEP_MS));
}

function simulateRamp(settings: ExperimentSettings, random: () => number) {
  const radiusPx = getBallRadius(settings);
  const radiusMeters = getRadiusMeters(radiusPx);
  const ramp = getRampPoints(settings);
  const start = getBallStart(settings);
  const tangent = { x: Math.cos(ramp.angle), y: Math.sin(ramp.angle) };
  const normal = { x: -Math.sin(ramp.angle), y: Math.cos(ramp.angle) };
  const shape = SHAPE_PHYSICS[settings.shape];
  const crr = getTextureCrr(settings) * (settings.mode === "messy" ? 1.08 : 1);
  const startAlongRamp = radiusPx + 20;
  const endAlongRamp = Math.max(startAlongRamp + 1, ramp.length - radiusPx * 0.25);
  const rampDistanceMeters = (endAlongRamp - startAlongRamp) / PIXELS_PER_METER;
  const frames: MotionFrame[] = [];
  let distanceMeters = 0;
  let speed = 0;
  let angle = -settings.rampHeight * 0.04;

  pushFrame(frames, start.x, start.y, angle, speed);

  for (let step = 0; step < MAX_STEPS && distanceMeters < rampDistanceMeters; step += 1) {
    const alongAcceleration =
      ((GRAVITY * (Math.sin(ramp.angle) - crr * Math.cos(ramp.angle))) /
        (1 + shape.inertiaRatio)) *
      shape.rampEfficiency;
    const airLoss = dragAcceleration(speed, settings, radiusMeters) / (1 + shape.inertiaRatio);
    const wobbleLoss = shape.wobble * Math.sin(distanceMeters * 10 + settings.rampHeight) * 0.08;
    const messyNoise = settings.mode === "messy" ? (random() - 0.5) * 0.18 : 0;
    const acceleration = Math.max(0, alongAcceleration - airLoss - Math.max(0, wobbleLoss) + messyNoise);

    speed = Math.max(0, speed + acceleration * STEP_SECONDS);
    distanceMeters += speed * STEP_SECONDS;
    angle += (speed * STEP_SECONDS) / Math.max(0.01, radiusMeters);

    const alongPixels = startAlongRamp + distanceMeters * PIXELS_PER_METER;
    const x = ramp.start.x + tangent.x * alongPixels - normal.x * (radiusPx + 10);
    const y = ramp.start.y + tangent.y * alongPixels - normal.y * (radiusPx + 10);
    pushFrame(frames, x, y, angle, speed);
  }

  const endX = ramp.start.x + tangent.x * endAlongRamp - normal.x * (radiusPx + 10);
  const endY = ramp.start.y + tangent.y * endAlongRamp - normal.y * (radiusPx + 10);

  return {
    frames,
    end: { x: endX, y: endY },
    tangent,
    speed,
    angle,
    radiusPx,
    radiusMeters,
  };
}

function simulateRampTransition(
  settings: ExperimentSettings,
  rampResult: ReturnType<typeof simulateRamp>,
  frames: MotionFrame[],
) {
  const shape = SHAPE_PHYSICS[settings.shape];
  const startX = rampResult.end.x;
  const startY = rampResult.end.y;
  const endX = startX + RAMP_TRANSITION_RUN;
  const transitionAngleStep = (rampResult.speed * STEP_SECONDS) / Math.max(0.01, rampResult.radiusMeters);
  const expectedEndAngle = rampResult.angle + transitionAngleStep * 18;
  const endY = getFloorContactY(settings, rampResult.radiusPx, expectedEndAngle);
  const startTangent = {
    x: rampResult.tangent.x * RAMP_TRANSITION_RUN * 0.7,
    y: rampResult.tangent.y * RAMP_TRANSITION_RUN * 0.7,
  };
  const endTangent = {
    x: RAMP_TRANSITION_RUN * 0.7,
    y: 0,
  };
  let angle = rampResult.angle;

  for (let step = 1; step <= 18; step += 1) {
    const t = step / 18;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
    const h10 = t ** 3 - 2 * t ** 2 + t;
    const h01 = -2 * t ** 3 + 3 * t ** 2;
    const h11 = t ** 3 - t ** 2;
    const x = h00 * startX + h10 * startTangent.x + h01 * endX + h11 * endTangent.x;
    const y = h00 * startY + h10 * startTangent.y + h01 * endY + h11 * endTangent.y;
    angle += transitionAngleStep;
    pushFrame(frames, x, y, angle, rampResult.speed);
  }

  return {
    x: endX,
    y: endY,
    speed: Math.max(0, rampResult.speed * shape.landingEfficiency),
    angle,
  };
}

function simulateFloor(
  settings: ExperimentSettings,
  floorStart: ReturnType<typeof simulateRampTransition>,
  rampResult: ReturnType<typeof simulateRamp>,
  frames: MotionFrame[],
  random: () => number,
) {
  const shape = SHAPE_PHYSICS[settings.shape];
  const crr = getFloorCrr(settings) * shape.floorLossMultiplier;
  const messyLoss = settings.mode === "messy" ? 1.12 : 1;
  let x = floorStart.x;
  let angle = floorStart.angle;
  let speed = floorStart.speed;
  let stoppedAt = frames.length * STEP_MS;
  let peakSpeed = Math.max(...frames.map((frame) => frame.speed), speed);

  for (let step = frames.length; step < MAX_STEPS; step += 1) {
    const airLoss = dragAcceleration(speed, settings, rampResult.radiusMeters);
    const rollingLoss = crr * messyLoss * GRAVITY;
    const wobbleLoss = shape.wobble * Math.abs(Math.sin(angle * 0.7)) * 0.28;
    const noisyLoss = settings.mode === "messy" ? Math.max(0, (random() - 0.35) * 0.18) : 0;
    const acceleration = rollingLoss + airLoss + wobbleLoss + noisyLoss;

    speed = Math.max(0, speed - acceleration * STEP_SECONDS);
    x += speed * PIXELS_PER_METER * STEP_SECONDS;
    angle += (speed * STEP_SECONDS) / Math.max(0.01, rampResult.radiusMeters);
    peakSpeed = Math.max(peakSpeed, speed);
    const displayAngle = speed < 0.08 ? settleAngle(settings, angle) : angle;
    pushFrame(
      frames,
      x,
      getFloorContactY(settings, rampResult.radiusPx, displayAngle),
      displayAngle,
      speed,
    );

    if (speed < 0.03 || x > PREDICTION_MAX_X + 160 || x < PREDICTION_MIN_X - 160) {
      stoppedAt = frames.length * STEP_MS;
      break;
    }
  }

  return {
    landingX: clamp(x, PREDICTION_MIN_X, PREDICTION_MAX_X),
    stopTime: stoppedAt,
    peakSpeed,
  };
}

export function simulateRoll(settings: ExperimentSettings, seedSuffix = "roll"): SimulationResult {
  const seed = seedFromSettings([
    settings.rampHeight.toString(),
    settings.rampLength.toString(),
    settings.ballSize.toString(),
    settings.ballWeight.toString(),
    settings.shape,
    settings.texture,
    settings.mode,
    seedSuffix,
  ]);
  const random = mulberry32(seed);
  const rampResult = simulateRamp(settings, random);
  const frames = [...rampResult.frames];
  const floorStart = simulateRampTransition(settings, rampResult, frames);
  const floorResult = simulateFloor(settings, floorStart, rampResult, frames, random);
  const finalFrame = frames.at(-1) ?? makeFrame(PREDICTION_MIN_X, FLOOR_Y, 0, 0, 0);

  return {
    frames,
    landingX: floorResult.landingX,
    stopTime: floorResult.stopTime,
    peakSpeed: Math.max(floorResult.peakSpeed, finalFrame.speed),
    rampAngle: getRampPoints(settings).angle,
  };
}
