import type { BallColor, ExperimentSettings, ShapeKind, TextureKind } from "./types";

export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 560;
export const FLOOR_Y = 430;
export const RAMP_END_X = 360;
export const RAMP_END_Y = FLOOR_Y - 42;
export const RAMP_LENGTH_MIN = 322;
export const RAMP_LENGTH_MAX = 520;
export const RAMP_RISE_MIN = 45;
export const RAMP_RISE_MAX = 210;
export const RAMP_TRANSITION_RUN = 118;
export const PREDICTION_MIN_X = 420;
export const PREDICTION_MAX_X = 1020;

export const DEFAULT_SETTINGS: ExperimentSettings = {
  rampHeight: 6,
  rampLength: 6,
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

export const CONTROL_LABELS: Record<
  keyof Pick<ExperimentSettings, "rampHeight" | "rampLength" | "ballSize" | "ballWeight">,
  string
> = {
  rampHeight: "Ramp height",
  rampLength: "Ramp length",
  ballSize: "Ball size",
  ballWeight: "Ball weight",
};
