import assert from "node:assert/strict";
import { test } from "node:test";
import type { Fight } from "../data/event";
import type { Ballot } from "./ballots";
import { guessLines, sortGuessBallots, splitFighterName } from "./guesses.ts";

const card: Fight[] = [
  {
    id: "main",
    card: "main",
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
    card: "main",
    order: "#2",
    isMain: false,
    weight: "68 KG",
    rules: "BOXING",
    rounds: "10",
    roundTime: "3:00",
    red: { id: 3, name: "RED TWO", photo: null },
    blue: { id: 4, name: "BLUE TWO", photo: null },
  },
  {
    id: "prelim",
    card: "prelims",
    order: "#1",
    isMain: false,
    weight: "67 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 5, name: "RED PRELIM", photo: null },
    blue: { id: 6, name: "BLUE PRELIM", photo: null },
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
    lines.map((line) => [line.card, line.order, line.winner, line.methodLabel]),
    [
      ["main", "PAGRINDINĖ KOVA", "RED FIGHTER", "Nokautu 2 r."],
      ["main", "#2", null, null],
      ["prelims", "#1", null, null],
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

test("exposes the guessed fighter's last name next to the full name", () => {
  const [picked, skipped] = guessLines(
    ballot({
      voterId: "a",
      name: "Ada",
      picks: { main: { corner: "red", method: "points", round: null } },
    }),
    card,
  );

  assert.equal(picked.winner, "RED FIGHTER");
  assert.equal(picked.firstName, "RED");
  assert.equal(picked.lastName, "FIGHTER");
  assert.equal(skipped.winner, null);
  assert.equal(skipped.lastName, null);
});

test("treats a single-token fighter name as the last name", () => {
  const { firstName, lastName } = splitFighterName("MINEIRO");
  assert.equal(firstName, null);
  assert.equal(lastName, "MINEIRO");
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
