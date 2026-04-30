"use client";

import { Target } from "lucide-react";
import { BALL_COLORS } from "@/lib/simulator/constants";
import { createRunSummary } from "@/lib/simulator/scoring";
import type { ExperimentRun } from "@/lib/simulator/types";

type HistoryPanelProps = {
  runs: ExperimentRun[];
  onRestore: (run: ExperimentRun) => void;
};

export function HistoryPanel({ runs, onRestore }: HistoryPanelProps) {
  return (
    <section className="historyPanel" aria-label="Prediction log">
      <header className="panelHeader">
        <Target size={17} aria-hidden />
        <h2>Prediction log</h2>
      </header>

      {runs.length === 0 ? (
        <p className="emptyState">No rolls yet</p>
      ) : (
        <ol className="historyList">
          {runs.slice(0, 8).map((run, index) => {
            const summary = createRunSummary(run);
            const color = BALL_COLORS[run.settings.color];

            return (
              <li key={run.id}>
                <button onClick={() => onRestore(run)}>
                  <span className="runDot" style={{ background: color.fill }} />
                  <span className="runMeta">
                    <strong>Run {runs.length - index}</strong>
                    <span>
                      P {summary.predicted} · L {summary.landed} · Δ {summary.miss}
                    </span>
                  </span>
                  <em>{summary.score}</em>
                </button>
                <small>{run.changedFromPrevious.join(", ")}</small>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
