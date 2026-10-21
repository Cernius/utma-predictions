import type { Corner } from "./event";

/** Matches the pick vocabulary: every decision is "points", every stoppage "ko". */
export type ResultMethod = "ko" | "points";

export type FightResult = {
  winner: Corner;
  method: ResultMethod;
  /** Round the fight ended in — the final round for a decision. */
  round: number;
  /** UTMA's own wording: TKO, KO, VIENBALSIS TEISĖJŲ SPRENDIMAS… */
  label: string;
  time: string;
};

/**
 * Official outcomes, transcribed from the UTMA stats fight cards:
 * https://stats.uniquetma.com/fightcard/20/main-card and /prelims.
 * Keyed by the fight ids in event.ts — a missing entry means "not fought yet".
 */
export const results: Record<string, FightResult> = {
  "prelim-26-200": { winner: "red", method: "ko", round: 3, label: "TKO", time: "2:22" },
  "prelim-103-211": {
    winner: "red",
    method: "points",
    round: 3,
    label: "VIENBALSIS TEISĖJŲ SPRENDIMAS",
    time: "3:00",
  },
  "prelim-59-25": {
    winner: "red",
    method: "points",
    round: 4,
    label: "VIENBALSIS TEISĖJŲ SPRENDIMAS",
    time: "3:00",
  },
  "prelim-101-61": { winner: "blue", method: "ko", round: 3, label: "KO", time: "2:01" },
  "main-16-54": { winner: "red", method: "ko", round: 1, label: "TKO", time: "0:00" },
  "main-28-202": {
    winner: "blue",
    method: "points",
    round: 3,
    label: "NEVIENBALSIS TEISĖJŲ SPRENDIMAS",
    time: "3:00",
  },
  "main-181-21": { winner: "blue", method: "ko", round: 3, label: "KO", time: "0:18" },
  "main-31-23": { winner: "red", method: "ko", round: 1, label: "TKO", time: "0:14" },
  "main-18-182": { winner: "blue", method: "ko", round: 3, label: "TKO", time: "0:02" },
  "main-24-95": { winner: "blue", method: "ko", round: 1, label: "KO", time: "1:08" },
  "main-140-210": { winner: "red", method: "ko", round: 2, label: "KO", time: "1:49" },
  "main-48-17": { winner: "red", method: "ko", round: 1, label: "TKO", time: "1:57" },
};
