import { getLandingDistance } from "./geometry";
import type { ExperimentRun, ExperimentSettings } from "./types";

const SETTING_LABELS: Record<keyof ExperimentSettings, string> = {
  rampHeight: "height",
  rampLength: "length",
  ballSize: "size",
  ballWeight: "weight",
  shape: "shape",
  texture: "texture",
  color: "color",
  mode: "world",
};

export function getPredictionScore(missDistance: number) {
  if (missDistance < 12) {
    return "bullseye";
  }

  if (missDistance < 32) {
    return "close";
  }

  if (missDistance < 72) {
    return "near";
  }

  return "surprise";
}

export function describeChangedSettings(
  previous: ExperimentSettings | undefined,
  next: ExperimentSettings,
) {
  if (!previous) {
    return ["first run"];
  }

  return (Object.keys(next) as Array<keyof ExperimentSettings>)
    .filter((key) => previous[key] !== next[key])
    .map((key) => SETTING_LABELS[key]);
}

export function createRunSummary(run: Pick<ExperimentRun, "landingX" | "predictionX" | "missDistance">) {
  return {
    predicted: Math.round(getLandingDistance(run.predictionX)),
    landed: Math.round(getLandingDistance(run.landingX)),
    miss: Math.round(run.missDistance),
    score: getPredictionScore(run.missDistance),
  };
}

export function createExperimentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
