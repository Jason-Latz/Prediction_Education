"use client";

import { useEffect, useRef, useState } from "react";
import {
  BALL_COLORS,
  FLOOR_Y,
  PREDICTION_MAX_X,
  PREDICTION_MIN_X,
  STAGE_HEIGHT,
  STAGE_WIDTH,
} from "@/lib/simulator/constants";
import {
  canvasToPredictionX,
  getBallRadius,
  getBallStart,
  getRampPoints,
} from "@/lib/simulator/geometry";
import type { ExperimentRun, ExperimentSettings, MotionFrame } from "@/lib/simulator/types";

type StageCanvasProps = {
  settings: ExperimentSettings;
  predictionX: number;
  runs: ExperimentRun[];
  currentRun: ExperimentRun | null;
  frameIndex: number;
  onPredictionChange: (value: number) => void;
};

function drawBall(
  context: CanvasRenderingContext2D,
  settings: ExperimentSettings,
  x: number,
  y: number,
  angle = 0,
) {
  const radius = getBallRadius(settings);
  const color = BALL_COLORS[settings.color];

  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.fillStyle = color.fill;
  context.strokeStyle = color.stroke;
  context.lineWidth = 3;

  if (settings.shape === "cube") {
    const side = radius * 1.65;
    context.beginPath();
    context.roundRect(-side / 2, -side / 2, side, side, 4);
    context.fill();
    context.stroke();
  } else if (settings.shape === "egg") {
    context.beginPath();
    context.ellipse(0, 0, radius * 0.78, radius * 1.18, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  } else {
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    if (settings.shape === "cylinder") {
      context.strokeStyle = "rgba(255,255,255,0.75)";
      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(0, 0, radius * 0.55, radius * 0.9, 0, 0, Math.PI * 2);
      context.stroke();
    }
  }

  context.restore();
}

function drawPredictionFlag(context: CanvasRenderingContext2D, predictionX: number) {
  context.save();
  context.strokeStyle = "#0f172a";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(predictionX, FLOOR_Y - 98);
  context.lineTo(predictionX, FLOOR_Y + 14);
  context.stroke();

  context.fillStyle = "#f97316";
  context.beginPath();
  context.moveTo(predictionX + 2, FLOOR_Y - 96);
  context.lineTo(predictionX + 58, FLOOR_Y - 78);
  context.lineTo(predictionX + 2, FLOOR_Y - 60);
  context.closePath();
  context.fill();

  context.fillStyle = "#0f172a";
  context.font = "700 18px Geist, Arial, sans-serif";
  context.fillText("prediction", predictionX - 42, FLOOR_Y + 40);
  context.restore();
}

function drawRunTrail(
  context: CanvasRenderingContext2D,
  run: ExperimentRun,
  index: number,
  maxFrame = run.frames.length - 1,
) {
  const color = BALL_COLORS[run.settings.color];
  const frames = run.frames.slice(0, Math.max(1, maxFrame));

  context.save();
  context.globalAlpha = Math.max(0.22, 0.72 - index * 0.08);
  context.strokeStyle = color.stroke;
  context.lineWidth = Math.max(2, 5 - index * 0.35);
  context.beginPath();

  frames.forEach((frame, frameIndex) => {
    if (frameIndex % 5 !== 0 && frameIndex !== frames.length - 1) {
      return;
    }

    if (frameIndex === 0) {
      context.moveTo(frame.x, frame.y);
    } else {
      context.lineTo(frame.x, frame.y);
    }
  });

  context.stroke();
  context.globalAlpha = 1;

  context.fillStyle = color.fill;
  context.strokeStyle = "#20302f";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(run.landingX, FLOOR_Y - 8, 9, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.strokeStyle = "rgba(15, 23, 42, 0.3)";
  context.setLineDash([5, 5]);
  context.beginPath();
  context.moveTo(run.predictionX, FLOOR_Y - 54);
  context.lineTo(run.landingX, FLOOR_Y - 24);
  context.stroke();
  context.restore();
}

function drawStage(
  context: CanvasRenderingContext2D,
  settings: ExperimentSettings,
  predictionX: number,
  runs: ExperimentRun[],
  currentRun: ExperimentRun | null,
  frameIndex: number,
) {
  const ramp = getRampPoints(settings);
  const ballStart = getBallStart(settings);
  const activeFrame: MotionFrame | undefined = currentRun
    ? currentRun.frames[frameIndex] ?? currentRun.frames.at(-1)
    : undefined;

  context.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  context.fillStyle = "#b7dbe5";
  context.fillRect(0, 0, STAGE_WIDTH, FLOOR_Y);

  context.strokeStyle = "rgba(25, 48, 52, 0.12)";
  context.lineWidth = 1;
  for (let x = 40; x < STAGE_WIDTH; x += 40) {
    context.beginPath();
    context.moveTo(x, FLOOR_Y - 160);
    context.lineTo(x, FLOOR_Y + 46);
    context.stroke();
  }

  context.fillStyle = "#d6ccb7";
  context.fillRect(0, FLOOR_Y, STAGE_WIDTH, STAGE_HEIGHT - FLOOR_Y);

  context.fillStyle = "#c6b99f";
  context.fillRect(PREDICTION_MIN_X, FLOOR_Y + 8, PREDICTION_MAX_X - PREDICTION_MIN_X, 22);

  context.strokeStyle = "#3f4947";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(PREDICTION_MIN_X, FLOOR_Y);
  context.lineTo(PREDICTION_MAX_X, FLOOR_Y);
  context.stroke();

  for (let x = PREDICTION_MIN_X; x <= PREDICTION_MAX_X; x += 55) {
    context.strokeStyle = "rgba(31,41,55,0.35)";
    context.beginPath();
    context.moveTo(x, FLOOR_Y + 2);
    context.lineTo(x, FLOOR_Y + 22);
    context.stroke();
  }

  runs
    .slice(0, 8)
    .reverse()
    .forEach((run, index) => {
      const maxFrame = currentRun?.id === run.id ? frameIndex : run.frames.length - 1;
      drawRunTrail(context, run, index, maxFrame);
    });

  context.strokeStyle = "#6b5137";
  context.lineWidth = 20;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(ramp.start.x, ramp.start.y);
  context.lineTo(ramp.end.x, ramp.end.y);
  context.stroke();

  context.strokeStyle = "rgba(32, 38, 36, 0.34)";
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(ramp.start.x + 16, ramp.start.y + 20);
  context.lineTo(ramp.start.x + 16, FLOOR_Y);
  context.moveTo(ramp.end.x - 16, ramp.end.y + 12);
  context.lineTo(ramp.end.x - 16, FLOOR_Y);
  context.stroke();

  drawPredictionFlag(context, predictionX);
  drawBall(
    context,
    currentRun?.settings ?? settings,
    activeFrame?.x ?? ballStart.x,
    activeFrame?.y ?? ballStart.y,
    activeFrame?.angle ?? -settings.rampHeight * 0.05,
  );
}

export function StageCanvas({
  settings,
  predictionX,
  runs,
  currentRun,
  frameIndex,
  onPredictionChange,
}: StageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = STAGE_WIDTH * pixelRatio;
    canvas.height = STAGE_HEIGHT * pixelRatio;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawStage(context, settings, predictionX, runs, currentRun, frameIndex);
  }, [currentRun, frameIndex, predictionX, runs, settings]);

  function updatePrediction(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    onPredictionChange(canvasToPredictionX(localX, rect.width));
  }

  return (
    <div className="stageShell" aria-label="Physics playground">
      <canvas
        ref={canvasRef}
        className="stageCanvas"
        onPointerDown={(event) => {
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          updatePrediction(event);
        }}
        onPointerMove={(event) => {
          if (dragging) {
            updatePrediction(event);
          }
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      />
    </div>
  );
}
