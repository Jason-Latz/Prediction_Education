"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_SETTINGS } from "@/lib/simulator/constants";
import { CHALLENGES, type ChallengeId } from "@/lib/simulator/challenges";
import { clampPredictionX } from "@/lib/simulator/geometry";
import { simulateRoll } from "@/lib/simulator/physics";
import { createExperimentId, describeChangedSettings } from "@/lib/simulator/scoring";
import { clearPlayground, loadPlayground, savePlayground } from "@/lib/simulator/storage";
import type { BallColor, ExperimentRun, ExperimentSettings, ShapeKind, TextureKind } from "@/lib/simulator/types";
import { ControlPanel } from "./ControlPanel";
import { ChallengeDock } from "./ChallengeDock";
import { ComparePanel } from "./ComparePanel";
import { HistoryPanel } from "./HistoryPanel";
import { StageCanvas } from "./StageCanvas";
import { TheoryPad } from "./TheoryPad";

const SHAPE_OPTIONS: ShapeKind[] = ["sphere", "cylinder", "cube", "egg"];
const TEXTURE_OPTIONS: TextureKind[] = ["smooth", "rubber", "felt", "gravel"];
const COLOR_OPTIONS: BallColor[] = ["teal", "coral", "gold", "violet", "ink"];

export function Simulator() {
  const [settings, setSettings] = useState<ExperimentSettings>(DEFAULT_SETTINGS);
  const [predictionX, setPredictionX] = useState(640);
  const [runs, setRuns] = useState<ExperimentRun[]>([]);
  const [currentRun, setCurrentRun] = useState<ExperimentRun | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeId | null>(null);
  const [loaded, setLoaded] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = loadPlayground();
    setSettings(saved.settings);
    setPredictionX(saved.predictionX);
    setRuns(saved.runs);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    savePlayground({ settings, predictionX, runs });
  }, [loaded, predictionX, runs, settings]);

  useEffect(() => {
    if (!isRolling || !currentRun) {
      return;
    }

    let animationId = 0;
    startTimeRef.current = null;

    function tick(timestamp: number) {
      if (!currentRun) {
        return;
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const nextIndex = currentRun.frames.findIndex((frame) => frame.t >= elapsed);
      const safeIndex = nextIndex === -1 ? currentRun.frames.length - 1 : nextIndex;
      setFrameIndex(safeIndex);

      if (safeIndex >= currentRun.frames.length - 1) {
        setIsRolling(false);
        return;
      }

      animationId = window.requestAnimationFrame(tick);
    }

    animationId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationId);
  }, [currentRun, isRolling]);

  const latestRun = runs[0];
  const activeFrame = useMemo(() => {
    if (!currentRun) {
      return undefined;
    }

    return currentRun.frames[frameIndex] ?? currentRun.frames.at(-1);
  }, [currentRun, frameIndex]);
  const activeChallenge = useMemo(
    () => CHALLENGES.find((challenge) => challenge.id === selectedChallenge) ?? null,
    [selectedChallenge],
  );

  function handleRoll() {
    const simulation = simulateRoll(settings, `${runs.length}-${Date.now()}`);
    const previousSettings = runs[0]?.settings;
    const run: ExperimentRun = {
      ...simulation,
      id: createExperimentId(),
      createdAt: Date.now(),
      predictionX,
      settings,
      missDistance: Math.abs(simulation.landingX - predictionX),
      changedFromPrevious: describeChangedSettings(previousSettings, settings),
    };

    setCurrentRun(run);
    setFrameIndex(0);
    setIsRolling(true);
    setRuns((previous) => [run, ...previous].slice(0, 12));
  }

  function handleReset() {
    clearPlayground();
    setSettings(DEFAULT_SETTINGS);
    setPredictionX(640);
    setRuns([]);
    setCurrentRun(null);
    setFrameIndex(0);
    setIsRolling(false);
  }

  function handleDuplicate() {
    if (!latestRun) {
      setSettings((previous) => ({ ...previous, color: "coral" }));
      return;
    }

    setSettings(latestRun.settings);
    setPredictionX(clampPredictionX(latestRun.predictionX));
  }

  function handleRestoreRun(run: ExperimentRun) {
    setSettings(run.settings);
    setPredictionX(clampPredictionX(run.predictionX));
  }

  function handleRandomize() {
    setSettings((previous) => ({
      ...previous,
      rampHeight: 1 + Math.floor(Math.random() * 10),
      ballSize: 1 + Math.floor(Math.random() * 10),
      ballWeight: 1 + Math.floor(Math.random() * 10),
      shape: SHAPE_OPTIONS[Math.floor(Math.random() * SHAPE_OPTIONS.length)],
      texture: TEXTURE_OPTIONS[Math.floor(Math.random() * TEXTURE_OPTIONS.length)],
      color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
    }));
  }

  return (
    <main className="appShell">
      <section className="playArea" aria-label="Prediction microworld">
        <StageCanvas
          settings={settings}
          predictionX={predictionX}
          runs={runs}
          currentRun={currentRun}
          frameIndex={frameIndex}
          challenge={activeChallenge}
          onPredictionChange={setPredictionX}
        />
      </section>
      <aside className="sideRail">
        <ControlPanel
          settings={settings}
          predictionX={predictionX}
          isRolling={isRolling}
          onChange={setSettings}
          onPredictionChange={setPredictionX}
          onRoll={handleRoll}
          onReset={handleReset}
          onDuplicate={handleDuplicate}
          onRandomize={handleRandomize}
        />
        <ChallengeDock selected={selectedChallenge} onSelect={setSelectedChallenge} />
        <ComparePanel runs={runs} />
        <TheoryPad />
        <HistoryPanel runs={runs} onRestore={handleRestoreRun} />
      </aside>
      <output className="runReadout" aria-live="polite">
        {latestRun
          ? `${Math.round(latestRun.missDistance)} px from prediction`
          : activeFrame
            ? `${Math.round(activeFrame.speed * 10)} speed`
            : "Ready"}
      </output>
    </main>
  );
}
