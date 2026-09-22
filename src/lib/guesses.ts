import type { Fight } from "../data/event";
import type { Ballot, Pick } from "./ballots";

export type GuessLine = {
  fightId: string;
  order: string;
  winner: string | null;
  methodLabel: string | null;
};

function formatMethod(pick: Pick): string | null {
  if (pick.method === "ko") return pick.round ? `Nokautu ${pick.round} r.` : "Nokautu";
  if (pick.method === "points") return "Taškais";
  return null;
}

function completeCount(ballot: Ballot): number {
  return Object.values(ballot.picks).filter((pick) => {
    if (pick.method === "points") return true;
    return pick.method === "ko" && typeof pick.round === "number";
  }).length;
}

/** One row per fight on the card, in card order — skipped fights stay as a dash. */
export function guessLines(ballot: Ballot, card: Fight[]): GuessLine[] {
  return card.map((fight) => {
    const pick = ballot.picks[fight.id];
    if (!pick) {
      return { fightId: fight.id, order: fight.order, winner: null, methodLabel: null };
    }
    const fighter = pick.corner === "red" ? fight.red : fight.blue;
    return {
      fightId: fight.id,
      order: fight.order,
      winner: fighter.name,
      methodLabel: formatMethod(pick),
    };
  });
}

/** You first, then the fullest cards — same social order as the home list. */
export function sortGuessBallots(ballots: Ballot[], myId: string): Ballot[] {
  return [...ballots].sort((a, b) => {
    const aMe = a.voterId === myId ? 0 : 1;
    const bMe = b.voterId === myId ? 0 : 1;
    if (aMe !== bMe) return aMe - bMe;
    return completeCount(b) - completeCount(a) || a.updatedAt - b.updatedAt;
  });
}
