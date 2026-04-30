"use client";

import { Flag } from "lucide-react";
import { CHALLENGES, type ChallengeId } from "@/lib/simulator/challenges";

type ChallengeDockProps = {
  selected: ChallengeId | null;
  onSelect: (challenge: ChallengeId | null) => void;
};

export function ChallengeDock({ selected, onSelect }: ChallengeDockProps) {
  return (
    <section className="challengeDock" aria-label="Challenge targets">
      <header className="panelHeader">
        <Flag size={17} aria-hidden />
        <h2>Targets</h2>
      </header>
      <div className="challengeGrid">
        <button className={selected === null ? "selected" : ""} onClick={() => onSelect(null)}>
          Free roll
        </button>
        {CHALLENGES.map((challenge) => (
          <button
            key={challenge.id}
            className={selected === challenge.id ? "selected" : ""}
            onClick={() => onSelect(challenge.id)}
          >
            {challenge.label}
          </button>
        ))}
      </div>
    </section>
  );
}
