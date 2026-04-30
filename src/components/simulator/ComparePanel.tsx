"use client";

import { GitCompareArrows } from "lucide-react";
import { createRunSummary } from "@/lib/simulator/scoring";
import type { ExperimentRun } from "@/lib/simulator/types";

type ComparePanelProps = {
  runs: ExperimentRun[];
};

export function ComparePanel({ runs }: ComparePanelProps) {
  const latest = runs[0];
  const previous = runs[1];

  return (
    <section className="comparePanel" aria-label="Run comparison">
      <header className="panelHeader">
        <GitCompareArrows size={17} aria-hidden />
        <h2>Compare</h2>
      </header>

      {!latest || !previous ? (
        <p className="emptyState">One run recorded</p>
      ) : (
        <div className="compareBody">
          <div>
            <span>Latest</span>
            <strong>{createRunSummary(latest).landed}</strong>
          </div>
          <div>
            <span>Before</span>
            <strong>{createRunSummary(previous).landed}</strong>
          </div>
          <div>
            <span>Shift</span>
            <strong>{Math.round(latest.landingX - previous.landingX)}</strong>
          </div>
          <p>{latest.changedFromPrevious.join(", ")}</p>
        </div>
      )}
    </section>
  );
}
