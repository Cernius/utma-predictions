export type Corner = "red" | "blue";

export type CardId = "main" | "prelims";

export type Fighter = {
  /** UTMA stats profile id */
  id: number;
  name: string;
  /** file in /public/fighters, or null when UTMA has no portrait for this fighter */
  photo: string | null;
};

export type Fight = {
  id: string;
  card: CardId;
  /** label shown in the order column: "PAGRINDINĖ KOVA" or "#2" */
  order: string;
  isMain: boolean;
  weight: string;
  rules: string;
  rounds: string;
  roundTime: string;
  red: Fighter;
  blue: Fighter;
};

/** Everything about an event that isn't the fights themselves. */
export type EventMeta = {
  id: string;
  name: string;
  tagline: string;
  date: string;
  venue: string;
  cardLabel: string;
  ticketsUrl: string;
  fightcardUrl: string;
  prelimsUrl: string;
  fighterProfileBase: string;
};

export type CardSection = { id: CardId; label: string; url: string };

/** Selectable KO rounds for a fight — 1…N, from the scheduled distance. */
export function roundOptions(fight: Fight): number[] {
  const total = Number.parseInt(fight.rounds, 10);
  const count = Number.isFinite(total) && total > 0 ? total : 3;
  return Array.from({ length: count }, (_, i) => i + 1);
}

export const event: EventMeta = {
  id: "utma-20",
  name: "UTMA #20",
  tagline: "KICKBOXING · MUAY THAI",
  date: "2026 10 24 · 19:00",
  venue: "ARENA VILNIUS",
  cardLabel: "PAGRINDINĖ KORTA",
  ticketsUrl: "https://www.bilietai.lt/series/Q5YZFI7GXO/utma-20",
  fightcardUrl: "https://stats.uniquetma.com/fightcard/21/main-card",
  prelimsUrl: "https://stats.uniquetma.com/fightcard/21/prelims",
  fighterProfileBase: "https://stats.uniquetma.com/fighters",
};

export const cardSections: CardSection[] = [
  { id: "prelims", label: "PRELIMS", url: event.prelimsUrl },
  { id: "main", label: "PAGRINDINĖ KORTA", url: event.fightcardUrl },
];

/**
 * Display order: prelims first, then the main card — last fight of each card on top.
 * UTMA also runs an early prelims card; it is deliberately left out of the game.
 */
export const fights: Fight[] = [
  {
    id: "prelim-223-97",
    card: "prelims",
    order: "#4",
    isMain: false,
    weight: "58 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 223, name: "AYA BOUTAFALA", photo: null },
    blue: { id: 97, name: "ALINA MARTYNIUK", photo: "alina-martyniuk.png" },
  },
  {
    id: "prelim-38-29",
    card: "prelims",
    order: "#3",
    isMain: false,
    weight: "67 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 38, name: "MATAS PULTARAŽINSKAS", photo: "matas-pultarazinskas.png" },
    blue: { id: 29, name: "OSVALD FEDOROVIČ", photo: "osvald-fedorovic.png" },
  },
  {
    id: "prelim-224-54",
    card: "prelims",
    order: "#2",
    isMain: false,
    weight: "81 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 224, name: "MINDAUGAS GEDMINAS", photo: null },
    blue: { id: 54, name: "ARNOLDAS MISIŪNAS", photo: "arnoldas-misiunas.png" },
  },
  {
    id: "prelim-225-34",
    card: "prelims",
    order: "#1",
    isMain: false,
    weight: "95 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 225, name: "BURAK ÜNAL", photo: null },
    blue: { id: 34, name: "EDVINAS ŠALKOVSKI", photo: "edvinas-salkovski.png" },
  },
  {
    id: "main-226-153",
    card: "main",
    order: "#8",
    isMain: false,
    weight: "95+ KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 226, name: "ION GRIGORE", photo: null },
    blue: { id: 153, name: "TOMAS PAKUTINSKAS", photo: null },
  },
  {
    id: "main-227-133",
    card: "main",
    order: "#7",
    isMain: false,
    weight: "95+ KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 227, name: "MARKAS MOLOTOKAS", photo: null },
    blue: { id: 133, name: "MANTAS RIMDEIKA", photo: "mantas-rimdeika.png" },
  },
  {
    id: "main-23-50",
    card: "main",
    order: "#6",
    isMain: false,
    weight: "75 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 23, name: "MANTVYDAS PEREDNIS", photo: "mantvydas-perednis.png" },
    blue: { id: 50, name: "RAIMONDAS KRILAVIČIUS", photo: "raimondas-krilavicius.png" },
  },
  {
    id: "main-187-33",
    card: "main",
    order: "#5",
    isMain: false,
    weight: "67 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 187, name: "CENGIZ LALE", photo: "cengiz-lale.png" },
    blue: { id: 33, name: "VITAS KAROSAS", photo: "vitas-karosas.png" },
  },
  {
    id: "main-202-16",
    card: "main",
    order: "#4",
    isMain: false,
    weight: "81 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 202, name: "RODRIGO MINEIRO", photo: null },
    blue: { id: 16, name: "DEIVIDAS JEMELJANOVAS", photo: "deividas-jameljanovas.png" },
  },
  {
    id: "main-21-31",
    card: "main",
    order: "#3",
    isMain: false,
    weight: "81 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 21, name: "ISA GÖÇMEN", photo: "isa-gocmen.png" },
    blue: { id: 31, name: "TOMAS BANSKIS", photo: "tomas-banskis.png" },
  },
  {
    id: "main-190-36",
    card: "main",
    order: "#2",
    isMain: false,
    weight: "75 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 190, name: "AKRAM BELMEKI", photo: "akram-belmeki.png" },
    blue: { id: 36, name: "RAIMONDAS AVLASEVIČIUS", photo: "raimondas-avlasevicius.png" },
  },
  {
    id: "main-26-59",
    card: "main",
    order: "PAGRINDINĖ KOVA",
    isMain: true,
    weight: "95 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 26, name: "NAGLIS KANIŠAUSKAS", photo: "naglis-kanisauskas.png" },
    blue: { id: 59, name: "IGNAS PAULIUKEVIČIUS", photo: "ignas-pauliukevicius.png" },
  },
];
