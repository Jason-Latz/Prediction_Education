"use client";

import { Copy, Gauge, Play, RotateCcw, Shuffle } from "lucide-react";
import {
  BALL_COLORS,
  CONTROL_LABELS,
  SHAPES,
  TEXTURES,
} from "@/lib/simulator/constants";
import type { BallColor, ExperimentSettings, ShapeKind, TextureKind, WorldMode } from "@/lib/simulator/types";

type ControlPanelProps = {
  settings: ExperimentSettings;
  isRolling: boolean;
  onChange: (settings: ExperimentSettings) => void;
  onRoll: () => void;
  onReset: () => void;
  onDuplicate: () => void;
  onRandomize: () => void;
};

function NumberControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="numberControl">
      <span>{label}</span>
      <strong>{value}</strong>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function ControlPanel({
  settings,
  isRolling,
  onChange,
  onRoll,
  onReset,
  onDuplicate,
  onRandomize,
}: ControlPanelProps) {
  function patch(next: Partial<ExperimentSettings>) {
    onChange({ ...settings, ...next });
  }

  return (
    <section className="controlPanel" aria-label="Experiment controls">
      <div className="primaryActions">
        <button className="primaryButton" onClick={onRoll} disabled={isRolling}>
          <Play size={18} aria-hidden />
          Roll
        </button>
        <button className="iconButton" onClick={onDuplicate} aria-label="Same except">
          <Copy size={18} aria-hidden />
        </button>
        <button className="iconButton" onClick={onRandomize} aria-label="Mix setup">
          <Shuffle size={18} aria-hidden />
        </button>
        <button className="iconButton" onClick={onReset} aria-label="Reset">
          <RotateCcw size={18} aria-hidden />
        </button>
      </div>

      <div className="modeSwitch" role="group" aria-label="World mode">
        {(["clean", "messy"] as WorldMode[]).map((mode) => (
          <button
            key={mode}
            className={settings.mode === mode ? "selected" : ""}
            onClick={() => patch({ mode })}
          >
            <Gauge size={16} aria-hidden />
            {mode}
          </button>
        ))}
      </div>

      <div className="controlGrid">
        <NumberControl
          label={CONTROL_LABELS.rampHeight}
          value={settings.rampHeight}
          onChange={(rampHeight) => patch({ rampHeight })}
        />
        <NumberControl
          label={CONTROL_LABELS.ballSize}
          value={settings.ballSize}
          onChange={(ballSize) => patch({ ballSize })}
        />
        <NumberControl
          label={CONTROL_LABELS.ballWeight}
          value={settings.ballWeight}
          onChange={(ballWeight) => patch({ ballWeight })}
        />
      </div>

      <div className="choiceBlock">
        <span className="choiceLabel">Shape</span>
        <div className="shapeGrid">
          {SHAPES.map((shape) => (
            <button
              key={shape.id}
              className={settings.shape === shape.id ? "selected" : ""}
              onClick={() => patch({ shape: shape.id as ShapeKind })}
            >
              <span aria-hidden>{shape.icon}</span>
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      <div className="choiceBlock">
        <span className="choiceLabel">Texture</span>
        <div className="textureGrid">
          {TEXTURES.map((texture) => (
            <button
              key={texture.id}
              className={settings.texture === texture.id ? "selected" : ""}
              onClick={() => patch({ texture: texture.id as TextureKind })}
            >
              {texture.label}
            </button>
          ))}
        </div>
      </div>

      <div className="choiceBlock">
        <span className="choiceLabel">Color</span>
        <div className="swatchGrid">
          {(Object.keys(BALL_COLORS) as BallColor[]).map((color) => (
            <button
              key={color}
              className={settings.color === color ? "selected" : ""}
              style={{ "--swatch": BALL_COLORS[color].fill } as React.CSSProperties}
              onClick={() => patch({ color })}
              aria-label={BALL_COLORS[color].label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
