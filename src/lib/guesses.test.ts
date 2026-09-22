import assert from "node:assert/strict";
import { test } from "node:test";
import type { Fight } from "../data/event";
import type { Ballot } from "./ballots";
import { guessLines, sortGuessBallots } from "./guesses.ts";

const card: Fight[] = [
  {
    id: "main",
    order: "PAGRINDINĖ KOVA",
    isMain: true,
    weight: "94 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 1, name: "RED FIGHTER", photo: null },
    blue: { id: 2, name: "BLUE FIGHTER", photo: null },
  },
  {
    id: "co",
    order: "#2",
    isMain: false,
    weight: "68 KG",
    rules: "BOXING",
    rounds: "10",
    roundTime: "3:00",
    red: { id: 3, name: "RED TWO", photo: null },
    blue: { id: 4, name: "BLUE TWO", photo: null },
  },
];

function ballot(partial: Partial<Ballot> & Pick<Ballot, "voterId" | "name">): Ballot {
  return { updatedAt: 0, picks: {}, ...partial };
}

test("lists every fight in card order, with a dash when that person skipped it", () => {
  const lines = guessLines(
    ballot({
      voterId: "me",
      name: "Titas",
      picks: {
        main: { corner: "red", method: "ko", round: 2 },
      },
    }),
    card,
  );

  assert.deepEqual(
    lines.map((line) => [line.order, line.winner, line.methodLabel]),
    [
      ["PAGRINDINĖ KOVA", "RED FIGHTER", "Nokautu 2 r."],
      ["#2", null, null],
    ],
  );
});

test("formats a points win without a round", () => {
  const [line] = guessLines(
    ballot({
      voterId: "a",
      name: "Ada",
      picks: { main: { corner: "blue", method: "points", round: null } },
    }),
    card,
  );

  assert.equal(line.winner, "BLUE FIGHTER");
  assert.equal(line.methodLabel, "Taškais");
});

test("puts my ballot first, then the most complete cards", () => {
  const mine = ballot({
    voterId: "me",
    name: "Titas",
    updatedAt: 3,
    picks: { main: { corner: "red", method: "points", round: null } },
  });
  const fuller = ballot({
    voterId: "other",
    name: "Ada",
    updatedAt: 1,
    picks: {
      main: { corner: "red", method: "points", round: null },
      co: { corner: "blue", method: "ko", round: 1 },
    },
  });
  const older = ballot({
    voterId: "third",
    name: "Bob",
    updatedAt: 2,
    picks: { main: { corner: "blue", method: "points", round: null } },
  });

  assert.deepEqual(
    sortGuessBallots([fuller, older, mine], "me").map((row) => row.voterId),
    ["me", "other", "third"],
  );
});
