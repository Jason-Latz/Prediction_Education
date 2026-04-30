import type { BallColor, ExperimentSettings, ShapeKind, TextureKind } from "./types";

export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 560;
export const FLOOR_Y = 430;
export const RAMP_END_X = 310;
export const RAMP_END_Y = FLOOR_Y - 42;
export const RAMP_LENGTH = 285;
export const PREDICTION_MIN_X = 360;
export const PREDICTION_MAX_X = 910;

export const DEFAULT_SETTINGS: ExperimentSettings = {
  rampHeight: 6,
  ballSize: 5,
  ballWeight: 5,
  shape: "sphere",
  texture: "smooth",
  color: "teal",
  mode: "clean",
};

export const SHAPES: Array<{ id: ShapeKind; label: string; icon: string }> = [
  { id: "sphere", label: "Sphere", icon: "●" },
  { id: "cylinder", label: "Cylinder", icon: "◐" },
  { id: "cube", label: "Cube", icon: "■" },
  { id: "egg", label: "Egg", icon: "⬭" },
];

export const TEXTURES: Array<{ id: TextureKind; label: string; friction: number }> = [
  { id: "smooth", label: "Smooth", friction: 0.012 },
  { id: "rubber", label: "Rubber", friction: 0.027 },
  { id: "felt", label: "Felt", friction: 0.043 },
  { id: "gravel", label: "Gravel", friction: 0.061 },
];

export const BALL_COLORS: Record<BallColor, { label: string; fill: string; stroke: string }> = {
  teal: { label: "Teal", fill: "#10a69a", stroke: "#075e59" },
  coral: { label: "Coral", fill: "#ec6f5f", stroke: "#96372d" },
  gold: { label: "Gold", fill: "#e4a82c", stroke: "#8a5a05" },
  violet: { label: "Violet", fill: "#8b6bd9", stroke: "#46318d" },
  ink: { label: "Ink", fill: "#1f2937", stroke: "#0f172a" },
};

export const CONTROL_LABELS: Record<keyof Pick<ExperimentSettings, "rampHeight" | "ballSize" | "ballWeight">, string> = {
  rampHeight: "Ramp height",
  ballSize: "Ball size",
  ballWeight: "Ball weight",
};
