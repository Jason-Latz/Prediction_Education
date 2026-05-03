import {
  FLOOR_Y,
  PREDICTION_MAX_X,
  PREDICTION_MIN_X,
  RAMP_END_X,
  RAMP_END_Y,
  RAMP_LENGTH_MAX,
  RAMP_LENGTH_MIN,
  RAMP_RISE_MAX,
  RAMP_RISE_MIN,
  STAGE_HEIGHT,
  STAGE_WIDTH,
} from "./constants";
import type { ExperimentSettings, StagePoint } from "./types";

export type StageCamera = {
  scale: number;
  offsetX: number;
  offsetY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalize(value: number, min: number, max: number) {
  if (max === min) {
    return 0;
  }

  return clamp((value - min) / (max - min), 0, 1);
}

export function getRampLength(settings: Pick<ExperimentSettings, "rampLength">) {
  return RAMP_LENGTH_MIN + normalize(settings.rampLength, 1, 10) * (RAMP_LENGTH_MAX - RAMP_LENGTH_MIN);
}

export function getRampRise(settings: Pick<ExperimentSettings, "rampHeight">) {
  return RAMP_RISE_MIN + normalize(settings.rampHeight, 1, 10) * (RAMP_RISE_MAX - RAMP_RISE_MIN);
}

export function getRampAngle(settings: Pick<ExperimentSettings, "rampHeight" | "rampLength">) {
  const rise = getRampRise(settings);
  const length = getRampLength(settings);
  return Math.asin(clamp(rise / length, 0, 0.92));
}

export function getRampPoints(settings: Pick<ExperimentSettings, "rampHeight" | "rampLength">): {
  start: StagePoint;
  end: StagePoint;
  angle: number;
  length: number;
  rise: number;
} {
  const length = getRampLength(settings);
  const rise = getRampRise(settings);
  const angle = getRampAngle(settings);
  return {
    start: {
      x: RAMP_END_X - Math.cos(angle) * length,
      y: RAMP_END_Y - rise,
    },
    end: {
      x: RAMP_END_X,
      y: RAMP_END_Y,
    },
    angle,
    length,
    rise,
  };
}

export function getBallRadius(settings: Pick<ExperimentSettings, "ballSize">) {
  return 14 + settings.ballSize * 2.7;
}

export function getBallStart(settings: Pick<ExperimentSettings, "rampHeight" | "rampLength" | "ballSize">) {
  const radius = getBallRadius(settings);
  const ramp = getRampPoints(settings);
  const alongRamp = { x: Math.cos(ramp.angle), y: Math.sin(ramp.angle) };
  const normal = { x: -Math.sin(ramp.angle), y: Math.cos(ramp.angle) };

  return {
    x: ramp.start.x + alongRamp.x * (radius + 20) - normal.x * (radius + 10),
    y: ramp.start.y + alongRamp.y * (radius + 20) - normal.y * (radius + 10),
  };
}

export function clampPredictionX(value: number) {
  return clamp(value, PREDICTION_MIN_X, PREDICTION_MAX_X);
}

export function getStageCamera(settings: Pick<ExperimentSettings, "rampHeight" | "rampLength">): StageCamera {
  const ramp = getRampPoints(settings);
  const padding = 72;
  const minX = Math.min(0, ramp.start.x - padding);
  const maxX = Math.max(PREDICTION_MAX_X + padding, STAGE_WIDTH);
  const minY = Math.min(0, ramp.start.y - padding);
  const maxY = STAGE_HEIGHT;
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const scale = Math.min(1, (STAGE_WIDTH - 24) / contentWidth, (STAGE_HEIGHT - 24) / contentHeight);

  return {
    scale,
    offsetX: (STAGE_WIDTH - contentWidth * scale) / 2 - minX * scale,
    offsetY: (STAGE_HEIGHT - contentHeight * scale) / 2 - minY * scale,
    minX,
    maxX,
    minY,
    maxY,
  };
}

export function canvasToPredictionX(canvasX: number, canvasWidth: number, camera: StageCamera) {
  const stageX = (canvasX / canvasWidth) * STAGE_WIDTH;
  const worldX = (stageX - camera.offsetX) / camera.scale;
  return clampPredictionX(worldX);
}

export function getLandingDistance(x: number) {
  return Math.max(0, x - RAMP_END_X);
}

export function getFloorY() {
  return FLOOR_Y;
}
