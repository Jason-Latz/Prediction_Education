import { DEFAULT_SETTINGS } from "./constants";
import { clampPredictionX } from "./geometry";
import type { ExperimentRun, ExperimentSettings } from "./types";

const SETTINGS_KEY = "prediction-playground-settings";
const PREDICTION_KEY = "prediction-playground-prediction";
const RUNS_KEY = "prediction-playground-runs";

export type SavedPlayground = {
  settings: ExperimentSettings;
  predictionX: number;
  runs: ExperimentRun[];
};

function isSettings(value: unknown): value is ExperimentSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const settings = value as ExperimentSettings;
  return (
    typeof settings.rampHeight === "number" &&
    typeof settings.ballSize === "number" &&
    typeof settings.ballWeight === "number" &&
    typeof settings.shape === "string" &&
    typeof settings.texture === "string" &&
    typeof settings.color === "string" &&
    typeof settings.mode === "string"
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadPlayground(): SavedPlayground {
  const settings = readJson<unknown>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const predictionX = readJson<number>(PREDICTION_KEY, 640);
  const runs = readJson<ExperimentRun[]>(RUNS_KEY, []);

  return {
    settings: isSettings(settings) ? settings : DEFAULT_SETTINGS,
    predictionX: clampPredictionX(typeof predictionX === "number" ? predictionX : 640),
    runs: Array.isArray(runs) ? runs.slice(0, 12) : [],
  };
}

export function savePlayground(playground: SavedPlayground) {
  writeJson(SETTINGS_KEY, playground.settings);
  writeJson(PREDICTION_KEY, playground.predictionX);
  writeJson(RUNS_KEY, playground.runs.slice(0, 12));
}

export function clearPlayground() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SETTINGS_KEY);
  window.localStorage.removeItem(PREDICTION_KEY);
  window.localStorage.removeItem(RUNS_KEY);
}
