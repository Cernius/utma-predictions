import assert from "node:assert/strict";
import { test } from "node:test";
import { archivedFights as fights, archivedResults as results } from "../data/archive/utma-19.ts";
import type { Corner } from "../data/event.ts";
import { fights as liveFights } from "../data/event.ts";
import type { FightResult } from "../data/results.ts";
import { results as liveResults } from "../data/results.ts";
import type { Ballot, Method, Pick } from "./ballots";
import { maxPoints, rankBallots, scoreBallot, scorePick } from "./scoring.ts";

const ko: FightResult = { winner: "red", method: "ko", round: 2, label: "KO", time: "1:49" };
const decision: FightResult = {
  winner: "blue",
  method: "points",
  round: 3,
  label: "VIENBALSIS TEISĖJŲ SPRENDIMAS",
  time: "3:00",
};

const pick = (corner: Corner, method: Method | null = null, round: number | null = null): Pick => ({
  corner,
  method,
  round,
});

test("awards three points for the right winner, method and knockout round", () => {
  assert.equal(scorePick(pick("red", "ko", 2), ko), 3);
});

test("drops the round point when the knockout lands in another round", () => {
  assert.equal(scorePick(pick("red", "ko", 1), ko), 2);
});

test("awards two points for a decision called correctly", () => {
  assert.equal(scorePick(pick("blue", "points"), decision), 2);
});

test("awards one point when only the winner is right", () => {
  assert.equal(scorePick(pick("red", "points"), ko), 1);
  assert.equal(scorePick(pick("blue", "ko", 3), decision), 1);
});

test("awards nothing when the winner is wrong, however right the method", () => {
  assert.equal(scorePick(pick("blue", "ko", 2), ko), 0);
});

test("still credits the winner on a pick that was never finished", () => {
  // A bare corner, from a ballot cast before victory types existed.
  assert.equal(scorePick(pick("red"), ko), 1);
  // A knockout call with no round behind it.
  assert.equal(scorePick(pick("red", "ko"), ko), 1);
});

test("scores a missing pick, or an unfinished one on the wrong fighter, as zero", () => {
  assert.equal(scorePick(undefined, ko), 0);
  assert.equal(scorePick(pick("blue"), ko), 0);
  assert.equal(scorePick(pick("blue", "ko"), ko), 0);
});

test("a decision is worth two at most, a knockout three", () => {
  assert.equal(maxPoints(ko), 3);
  assert.equal(maxPoints(decision), 2);
});

test("totals a ballot against only the fights that have a result", () => {
  const card = fights.slice(0, 2);
  const scored = scoreBallot(
    {
      voterId: "me",
      name: "Titas",
      updatedAt: 1,
      picks: {
        [card[0].id]: { corner: results[card[0].id].winner, method: "ko", round: 3 },
        [card[1].id]: { corner: "red", method: "points", round: null },
      },
    },
    card,
    results,
  );

  assert.equal(scored.total, 3 + 2);
  assert.equal(scored.max, maxPoints(results[card[0].id]) + maxPoints(results[card[1].id]));
  assert.equal(scored.winners, 2);
  assert.equal(scored.lines.length, 2);
});

test("describes each line with the pick, the real result and the points earned", () => {
  const fight = fights.find((f) => f.id === "main-48-17")!;
  const [line] = scoreBallot(
    {
      voterId: "me",
      name: "Titas",
      updatedAt: 1,
      picks: { "main-48-17": { corner: "blue", method: "points", round: null } },
    },
    [fight],
    results,
  ).lines;

  assert.equal(line.pickedName, "DOMINYKAS DIRKSTYS");
  assert.equal(line.pickedMethodLabel, "Taškais");
  assert.equal(line.winnerName, "SERGEJ MASLOBOJEV");
  assert.equal(line.resultLabel, "TKO 1 r.");
  assert.equal(line.points, 0);
  assert.equal(line.winnerCorrect, false);
});

test("leaves a skipped fight without a pick to show", () => {
  const fight = fights.find((f) => f.id === "main-48-17")!;
  const [line] = scoreBallot(
    { voterId: "me", name: "Titas", updatedAt: 1, picks: {} },
    [fight],
    results,
  ).lines;

  assert.equal(line.pickedName, null);
  assert.equal(line.pickedMethodLabel, null);
  assert.equal(line.points, 0);
});

test("ranks by points, then winners called, then who got their card in first", () => {
  const card = fights.filter((f) => f.id === "main-48-17" || f.id === "main-140-210");
  // Both fights ended in a knockout for the red corner.
  const exact = (id: string): Pick => ({
    corner: results[id].winner,
    method: results[id].method,
    round: results[id].round,
  });
  const wrongWinner = (id: string): Pick => ({
    corner: results[id].winner === "red" ? "blue" : "red",
    method: "points",
    round: null,
  });
  /** Right winner and knockout, wrong round — two points. */
  const wrongRound = (id: string): Pick => ({
    corner: results[id].winner,
    method: "ko",
    round: results[id].round + 2,
  });
  /** Right winner, wrong method — one point. */
  const winnerOnly = (id: string): Pick => ({
    corner: results[id].winner,
    method: "points",
    round: null,
  });

  const ranked = rankBallots(
    [
      // 3 points off a single exact call, filed last
      {
        voterId: "late",
        name: "Late",
        updatedAt: 9,
        picks: { "main-48-17": exact("main-48-17"), "main-140-210": wrongWinner("main-140-210") },
      },
      // the same 3 points, but spread over two called winners — the better card
      {
        voterId: "spread",
        name: "Spread",
        updatedAt: 5,
        picks: {
          "main-48-17": wrongRound("main-48-17"),
          "main-140-210": winnerOnly("main-140-210"),
        },
      },
      // identical to "late", filed first
      {
        voterId: "early",
        name: "Early",
        updatedAt: 1,
        picks: { "main-48-17": exact("main-48-17"), "main-140-210": wrongWinner("main-140-210") },
      },
      {
        voterId: "best",
        name: "Best",
        updatedAt: 7,
        picks: { "main-48-17": exact("main-48-17"), "main-140-210": exact("main-140-210") },
      },
    ] satisfies Ballot[],
    card,
    results,
  );

  assert.deepEqual(
    ranked.map((row) => [row.voterId, row.total, row.winners, row.rank]),
    [
      ["best", 6, 2, 1],
      ["spread", 3, 2, 2],
      ["early", 3, 1, 3],
      ["late", 3, 1, 4],
    ],
  );
});

test("shares a rank between ballots that are level on every tiebreak", () => {
  const card = fights.filter((f) => f.id === "main-48-17");
  const same: Pick = { corner: "red", method: "points", round: null };
  const ranked = rankBallots(
    [
      { voterId: "a", name: "A", updatedAt: 4, picks: { "main-48-17": same } },
      { voterId: "b", name: "B", updatedAt: 4, picks: { "main-48-17": same } },
    ],
    card,
    results,
  );

  assert.deepEqual(ranked.map((row) => row.rank), [1, 1]);
});

test("the archived card has an official result for every fight", () => {
  assert.deepEqual(
    fights.filter((fight) => !results[fight.id]).map((fight) => fight.id),
    [],
  );
  assert.deepEqual(
    Object.keys(results).filter((id) => !fights.some((fight) => fight.id === id)),
    [],
  );
});

/** The live card fills in through the night, so only stray keys are an error. */
test("every live result is keyed to a fight on the live card", () => {
  assert.deepEqual(
    Object.keys(liveResults).filter((id) => !liveFights.some((fight) => fight.id === id)),
    [],
  );
});
