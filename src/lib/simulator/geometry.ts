import {
  FLOOR_Y,
  PREDICTION_MAX_X,
  PREDICTION_MIN_X,
  RAMP_END_X,
  RAMP_END_Y,
  RAMP_LENGTH,
} from "./constants";
import type { ExperimentSettings, StagePoint } from "./types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalize(value: number, min: number, max: number) {
  if (max === min) {
    return 0;
  }

  return clamp((value - min) / (max - min), 0, 1);
}

export function getRampAngle(settings: Pick<ExperimentSettings, "rampHeight">) {
  return (-10 - settings.rampHeight * 3.2) * (Math.PI / 180);
}

export function getRampPoints(settings: Pick<ExperimentSettings, "rampHeight">): {
  start: StagePoint;
  end: StagePoint;
  angle: number;
} {
  const angle = getRampAngle(settings);
  return {
    start: {
      x: RAMP_END_X - Math.cos(angle) * RAMP_LENGTH,
      y: RAMP_END_Y - Math.sin(angle) * RAMP_LENGTH,
    },
    end: {
      x: RAMP_END_X,
      y: RAMP_END_Y,
    },
    angle,
  };
}

export function getBallRadius(settings: Pick<ExperimentSettings, "ballSize">) {
  return 14 + settings.ballSize * 2.7;
}

export function clampPredictionX(value: number) {
  return clamp(value, PREDICTION_MIN_X, PREDICTION_MAX_X);
}

export function canvasToPredictionX(canvasX: number, canvasWidth: number) {
  return clampPredictionX((canvasX / canvasWidth) * 960);
}

export function getLandingDistance(x: number) {
  return Math.max(0, x - RAMP_END_X);
}

export function getFloorY() {
  return FLOOR_Y;
}
