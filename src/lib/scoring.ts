import type { CardId, Fight } from "../data/event";
import type { FightResult } from "../data/results";
import type { Ballot, Pick } from "./ballots";

export type ScoreLine = {
  fightId: string;
  card: CardId;
  order: string;
  /** Who this player called, or null if they skipped the fight. */
  pickedName: string | null;
  pickedMethodLabel: string | null;
  /** Who actually won, and how. */
  winnerName: string;
  resultLabel: string;
  points: number;
  max: number;
  winnerCorrect: boolean;
};

export type ScoredBallot = Ballot & {
  total: number;
  max: number;
  /** Fights where the winner was called, whatever the method. */
  winners: number;
  lines: ScoreLine[];
};

export type RankedBallot = ScoredBallot & { rank: number };

/**
 * Winner, method, round — each worth a point, each only counting once the one
 * before it is right. A pick left unfinished still names a fighter, so it keeps
 * the winner point and forfeits the rest.
 */
export function scorePick(pick: Pick | undefined, result: FightResult): number {
  if (!pick) return 0;
  if (pick.corner !== result.winner) return 0;
  if (!pick.method) return 1;
  if (pick.method === "ko" && typeof pick.round !== "number") return 1;
  if (pick.method !== result.method) return 1;
  if (result.method === "points") return 2;
  return pick.round === result.round ? 3 : 2;
}

/** A decision has no round to call, so it can only ever be worth two. */
export function maxPoints(result: FightResult): number {
  return result.method === "ko" ? 3 : 2;
}

function pickedMethodLabel(pick: Pick): string | null {
  if (pick.method === "ko") return pick.round ? `Nokautu ${pick.round} r.` : "Nokautu";
  if (pick.method === "points") return "Taškais";
  return null;
}

/** "TKO 1 r." for a stoppage, the judges' wording on its own for a decision. */
function resultLabel(result: FightResult): string {
  return result.method === "ko" ? `${result.label} ${result.round} r.` : result.label;
}

function line(fight: Fight, pick: Pick | undefined, result: FightResult): ScoreLine {
  const winner = result.winner === "red" ? fight.red : fight.blue;
  const picked = pick ? (pick.corner === "red" ? fight.red : fight.blue) : null;

  return {
    fightId: fight.id,
    card: fight.card,
    order: fight.order,
    pickedName: picked?.name ?? null,
    pickedMethodLabel: pick ? pickedMethodLabel(pick) : null,
    winnerName: winner.name,
    resultLabel: resultLabel(result),
    points: scorePick(pick, result),
    max: maxPoints(result),
    winnerCorrect: pick?.corner === result.winner,
  };
}

/** One line per fight that has been fought — undecided fights are left out. */
export function scoreBallot(
  ballot: Ballot,
  card: Fight[],
  results: Record<string, FightResult>,
): ScoredBallot {
  const lines = card
    .filter((fight) => results[fight.id])
    .map((fight) => line(fight, ballot.picks[fight.id], results[fight.id]));

  return {
    ...ballot,
    lines,
    total: lines.reduce((sum, row) => sum + row.points, 0),
    max: lines.reduce((sum, row) => sum + row.max, 0),
    winners: lines.filter((row) => row.winnerCorrect).length,
  };
}

/**
 * Most points first; level on points, the card that called more winners outranks
 * the one carried by a single exact knockout. Still level, the earlier ballot wins.
 */
export function rankBallots(
  ballots: Ballot[],
  card: Fight[],
  results: Record<string, FightResult>,
): RankedBallot[] {
  const scored = ballots
    .map((ballot) => scoreBallot(ballot, card, results))
    .sort(
      (a, b) => b.total - a.total || b.winners - a.winners || a.updatedAt - b.updatedAt,
    );

  let rank = 0;
  return scored.map((row, index) => {
    const previous = scored[index - 1];
    const tied =
      previous &&
      previous.total === row.total &&
      previous.winners === row.winners &&
      previous.updatedAt === row.updatedAt;
    if (!tied) rank = index + 1;
    return { ...row, rank };
  });
}
