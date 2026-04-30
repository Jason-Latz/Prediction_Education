export type ChallengeId = "island" | "harbor" | "near-edge" | "same-spot";

export type Challenge = {
  id: ChallengeId;
  label: string;
  targetX: number;
  width: number;
  color: string;
};

export const CHALLENGES: Challenge[] = [
  {
    id: "island",
    label: "Hit the island",
    targetX: 585,
    width: 80,
    color: "#0f766e",
  },
  {
    id: "harbor",
    label: "Soft landing",
    targetX: 470,
    width: 70,
    color: "#2563eb",
  },
  {
    id: "near-edge",
    label: "Far edge",
    targetX: 820,
    width: 76,
    color: "#b45309",
  },
  {
    id: "same-spot",
    label: "Same spot",
    targetX: 675,
    width: 54,
    color: "#7c3aed",
  },
];
