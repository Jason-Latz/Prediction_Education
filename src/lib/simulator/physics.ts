import Matter from "matter-js";
import {
  FLOOR_Y,
  PREDICTION_MAX_X,
  PREDICTION_MIN_X,
  RAMP_LENGTH,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  TEXTURES,
} from "./constants";
import { clamp, getBallRadius, getRampPoints } from "./geometry";
import { mulberry32, seedFromSettings } from "./random";
import type { ExperimentSettings, MotionFrame, SimulationResult } from "./types";

const STEP_MS = 1000 / 60;
const MAX_STEPS = 900;

const SHAPE_DRAG: Record<ExperimentSettings["shape"], number> = {
  sphere: 0.9992,
  cylinder: 0.9966,
  cube: 0.962,
  egg: 0.984,
};

const SHAPE_BOUNCE: Record<ExperimentSettings["shape"], number> = {
  sphere: 0.18,
  cylinder: 0.12,
  cube: 0.04,
  egg: 0.1,
};

function getTextureFriction(settings: Pick<ExperimentSettings, "texture">) {
  return TEXTURES.find((texture) => texture.id === settings.texture)?.friction ?? 0.02;
}

function getTextureLoss(settings: Pick<ExperimentSettings, "texture">) {
  return {
    smooth: 0.9992,
    rubber: 0.995,
    felt: 0.9905,
    gravel: 0.9845,
  }[settings.texture];
}

function makeBall(settings: ExperimentSettings, x: number, y: number, radius: number) {
  const common = {
    friction: 0.012 + getTextureFriction(settings) * 0.35,
    frictionStatic: 0.09 + getTextureFriction(settings) * 0.6,
    restitution: SHAPE_BOUNCE[settings.shape],
    frictionAir: 0.001 + getTextureFriction(settings) * 0.018,
    density: 0.00075 * (settings.mode === "clean" ? 1 : 0.7 + settings.ballWeight * 0.12),
    label: "prediction-ball",
  };

  if (settings.shape === "cube") {
    return Matter.Bodies.rectangle(x, y, radius * 1.65, radius * 1.65, {
      ...common,
      chamfer: { radius: radius * 0.04 },
    });
  }

  if (settings.shape === "egg") {
    const body = Matter.Bodies.polygon(x, y, 24, radius, common);
    Matter.Body.scale(body, 0.78, 1.18);
    Matter.Body.setCentre(body, { x: x + radius * 0.1, y }, false);
    return body;
  }

  const sides = settings.shape === "cylinder" ? 18 : 36;
  const body = Matter.Bodies.polygon(x, y, sides, radius, common);

  if (settings.shape === "cylinder") {
    Matter.Body.setInertia(body, body.inertia * 0.72);
  }

  return body;
}

function ballStart(settings: ExperimentSettings, radius: number) {
  const ramp = getRampPoints(settings);
  const alongRamp = { x: Math.cos(ramp.angle), y: Math.sin(ramp.angle) };
  const normal = { x: -Math.sin(ramp.angle), y: Math.cos(ramp.angle) };

  return {
    x: ramp.start.x + alongRamp.x * (radius + 20) - normal.x * (radius + 10),
    y: ramp.start.y + alongRamp.y * (radius + 20) - normal.y * (radius + 10),
  };
}

function addStaticWorld(engine: Matter.Engine, settings: ExperimentSettings) {
  const ramp = getRampPoints(settings);
  const rampMid = {
    x: (ramp.start.x + ramp.end.x) / 2,
    y: (ramp.start.y + ramp.end.y) / 2,
  };
  const floor = Matter.Bodies.rectangle(STAGE_WIDTH / 2, FLOOR_Y + 20, STAGE_WIDTH + 260, 40, {
    isStatic: true,
    friction: 0.035 + getTextureFriction(settings) * 0.45,
    label: "landing-floor",
  });
  const rampBody = Matter.Bodies.rectangle(rampMid.x, rampMid.y, RAMP_LENGTH + 56, 22, {
    isStatic: true,
    angle: ramp.angle,
    friction: 0.045 + getTextureFriction(settings) * 0.35,
    label: "ramp",
  });

  Matter.World.add(engine.world, [floor, rampBody]);
}

function applyMessyWorldForces(
  ball: Matter.Body,
  settings: ExperimentSettings,
  random: () => number,
) {
  if (settings.mode !== "messy") {
    return;
  }

  const wobble = settings.shape === "egg" ? 0.000018 : 0.000007;
  const weightFactor = 1 / Math.max(2, settings.ballWeight);
  const force = {
    x: (random() - 0.5) * wobble * weightFactor,
    y: (random() - 0.5) * wobble * 0.4,
  };

  Matter.Body.applyForce(ball, ball.position, force);
}

function applyRollingLoss(ball: Matter.Body, settings: ExperimentSettings, radius: number) {
  if (ball.position.y < FLOOR_Y - radius * 1.35) {
    return;
  }

  const textureLoss = getTextureLoss(settings);
  const sizeLoss = 0.994 + settings.ballSize * 0.00045;
  const shapeLoss = SHAPE_DRAG[settings.shape];
  const weightLoss = 0.9915 + settings.ballWeight * 0.00075;
  const cleanLoss = textureLoss * sizeLoss * shapeLoss * weightLoss;
  const messyPenalty = settings.mode === "messy" ? 0.993 : 1;
  const loss = clamp(cleanLoss * messyPenalty, 0.93, 0.9994);

  Matter.Body.setVelocity(ball, {
    x: ball.velocity.x * loss,
    y: ball.velocity.y,
  });
  Matter.Body.setAngularVelocity(ball, ball.angularVelocity * loss);
}

export function simulateRoll(settings: ExperimentSettings, seedSuffix = "roll"): SimulationResult {
  const engine = Matter.Engine.create({ enableSleeping: false });
  engine.gravity.y = 1.08;
  addStaticWorld(engine, settings);

  const radius = getBallRadius(settings);
  const start = ballStart(settings, radius);
  const ball = makeBall(settings, start.x, start.y, radius);
  const seed = seedFromSettings([
    settings.rampHeight.toString(),
    settings.ballSize.toString(),
    settings.ballWeight.toString(),
    settings.shape,
    settings.texture,
    settings.mode,
    seedSuffix,
  ]);
  const random = mulberry32(seed);

  Matter.World.add(engine.world, ball);

  const frames: MotionFrame[] = [];
  let peakSpeed = 0;
  let stableSteps = 0;
  let stoppedAt = MAX_STEPS * STEP_MS;

  for (let step = 0; step < MAX_STEPS; step += 1) {
    applyMessyWorldForces(ball, settings, random);
    Matter.Engine.update(engine, STEP_MS);
    applyRollingLoss(ball, settings, radius);

    peakSpeed = Math.max(peakSpeed, ball.speed);
    frames.push({
      x: clamp(ball.position.x, 0, STAGE_WIDTH),
      y: clamp(ball.position.y, 0, STAGE_HEIGHT),
      angle: ball.angle,
      speed: ball.speed,
      t: step * STEP_MS,
    });

    const onFloor = ball.position.y > FLOOR_Y - radius * 1.2;
    const slow = Math.abs(ball.velocity.x) < 0.05 && Math.abs(ball.angularVelocity) < 0.01;

    if (onFloor && slow && step > 90) {
      stableSteps += 1;
    } else {
      stableSteps = 0;
    }

    if (ball.position.x > PREDICTION_MAX_X + 90 || ball.position.y > STAGE_HEIGHT + 80) {
      stoppedAt = step * STEP_MS;
      break;
    }

    if (stableSteps > 24) {
      stoppedAt = step * STEP_MS;
      break;
    }
  }

  const finalFrame = frames.at(-1) ?? { x: PREDICTION_MIN_X, y: FLOOR_Y, angle: 0, speed: 0, t: 0 };
  const landingX = clamp(finalFrame.x, PREDICTION_MIN_X, PREDICTION_MAX_X);

  return {
    frames,
    landingX,
    stopTime: stoppedAt,
    peakSpeed,
    rampAngle: getRampPoints(settings).angle,
  };
}
