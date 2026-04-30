export type ShapeKind = "sphere" | "cylinder" | "cube" | "egg";

export type TextureKind = "smooth" | "rubber" | "felt" | "gravel";

export type WorldMode = "clean" | "messy";

export type BallColor = "teal" | "coral" | "gold" | "violet" | "ink";

export type ExperimentSettings = {
  rampHeight: number;
  ballSize: number;
  ballWeight: number;
  shape: ShapeKind;
  texture: TextureKind;
  color: BallColor;
  mode: WorldMode;
};

export type StagePoint = {
  x: number;
  y: number;
};

export type MotionFrame = StagePoint & {
  angle: number;
  speed: number;
  t: number;
};

export type SimulationResult = {
  frames: MotionFrame[];
  landingX: number;
  stopTime: number;
  peakSpeed: number;
  rampAngle: number;
};

export type ExperimentRun = SimulationResult & {
  id: string;
  createdAt: number;
  predictionX: number;
  settings: ExperimentSettings;
  missDistance: number;
  changedFromPrevious: string[];
};
