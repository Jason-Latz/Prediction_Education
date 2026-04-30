import { DEFAULT_SETTINGS } from "./constants";
import { clampPredictionX } from "./geometry";
import type { BallColor, ExperimentRun, ExperimentSettings, ShapeKind, TextureKind, WorldMode } from "./types";

const SETTINGS_KEY = "prediction-playground-settings";
const PREDICTION_KEY = "prediction-playground-prediction";
const RUNS_KEY = "prediction-playground-runs";
const SHAPES: ShapeKind[] = ["sphere", "cylinder", "cube", "egg"];
const TEXTURES: TextureKind[] = ["smooth", "rubber", "felt", "gravel"];
const COLORS: BallColor[] = ["teal", "coral", "gold", "violet", "ink"];
const MODES: WorldMode[] = ["clean", "messy"];

export type SavedPlayground = {
  settings: ExperimentSettings;
  predictionX: number;
  runs: ExperimentRun[];
};

function normalizeSettings(value: unknown): ExperimentSettings {
  if (!value || typeof value !== "object") {
    return DEFAULT_SETTINGS;
  }

  const settings = value as Partial<ExperimentSettings>;

  return {
    ...DEFAULT_SETTINGS,
    rampHeight: typeof settings.rampHeight === "number" ? settings.rampHeight : DEFAULT_SETTINGS.rampHeight,
    rampLength: typeof settings.rampLength === "number" ? settings.rampLength : DEFAULT_SETTINGS.rampLength,
    ballSize: typeof settings.ballSize === "number" ? settings.ballSize : DEFAULT_SETTINGS.ballSize,
    ballWeight: typeof settings.ballWeight === "number" ? settings.ballWeight : DEFAULT_SETTINGS.ballWeight,
    shape: settings.shape && SHAPES.includes(settings.shape) ? settings.shape : DEFAULT_SETTINGS.shape,
    texture: settings.texture && TEXTURES.includes(settings.texture) ? settings.texture : DEFAULT_SETTINGS.texture,
    color: settings.color && COLORS.includes(settings.color) ? settings.color : DEFAULT_SETTINGS.color,
    mode: settings.mode && MODES.includes(settings.mode) ? settings.mode : DEFAULT_SETTINGS.mode,
  };
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
    settings: normalizeSettings(settings),
    predictionX: clampPredictionX(typeof predictionX === "number" ? predictionX : 640),
    runs: Array.isArray(runs)
      ? runs.slice(0, 12).map((run) => ({
          ...run,
          settings: normalizeSettings(run.settings),
        }))
      : [],
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
