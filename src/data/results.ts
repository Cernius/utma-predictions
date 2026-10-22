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
 * Official outcomes for the live event, transcribed from the UTMA stats fight cards:
 * https://stats.uniquetma.com/fightcard/21/main-card and /prelims.
 * Keyed by the fight ids in event.ts — a missing entry means "not fought yet", so
 * /rezultatai fills in through the night as results are added here.
 *
 * Past events keep their own copy, e.g. src/data/archive/utma-19.ts.
 */
export const results: Record<string, FightResult> = {};
