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

/** Selectable KO rounds for a fight — 1…N, from the scheduled distance. */
export function roundOptions(fight: Fight): number[] {
  const total = Number.parseInt(fight.rounds, 10);
  const count = Number.isFinite(total) && total > 0 ? total : 3;
  return Array.from({ length: count }, (_, i) => i + 1);
}

export const event = {
  id: "utma-19",
  name: "UTMA #19",
  tagline: "KICKBOXING · MUAY THAI",
  date: "2026 09 26 · 19:00",
  venue: "KAUNO ŽALGIRIO ARENA",
  cardLabel: "PAGRINDINĖ KORTA",
  ticketsUrl: "https://kakava.lt/renginys/utma-19/12066/24951",
  fightcardUrl: "https://stats.uniquetma.com/fightcard/20/main-card",
  prelimsUrl: "https://stats.uniquetma.com/fightcard/20/prelims",
  fighterProfileBase: "https://stats.uniquetma.com/fighters",
};

export const cardSections: { id: CardId; label: string; url: string }[] = [
  { id: "main", label: "PAGRINDINĖ KORTA", url: event.fightcardUrl },
  { id: "prelims", label: "PRELIMS", url: event.prelimsUrl },
];

export const fights: Fight[] = [
  {
    id: "main-48-17",
    card: "main",
    order: "PAGRINDINĖ KOVA",
    isMain: true,
    weight: "94 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 48, name: "SERGEJ MASLOBOJEV", photo: "sergej-maslobojev.png" },
    blue: { id: 17, name: "DOMINYKAS DIRKSTYS", photo: "dominykas-dirkstys.png" },
  },
  {
    id: "main-140-210",
    card: "main",
    order: "#2",
    isMain: false,
    weight: "68 KG",
    rules: "PROFESSIONAL BOXING",
    rounds: "10",
    roundTime: "3:00",
    red: { id: 140, name: "EIMANTAS STANIONIS", photo: "eimantas-stanionis.png" },
    blue: { id: 210, name: "KAINE FOURIE", photo: null },
  },
  {
    id: "main-24-95",
    card: "main",
    order: "#3",
    isMain: false,
    weight: "67 KG",
    rules: "KICKBOXING",
    rounds: "5",
    roundTime: "3:00",
    red: { id: 24, name: "MARTYNAS DANIUS", photo: "martynas-danius.png" },
    blue: { id: 95, name: "KHYZER HAYAT", photo: "khyzer-hayat.png" },
  },
  {
    id: "main-18-182",
    card: "main",
    order: "#4",
    isMain: false,
    weight: "63.5 KG",
    rules: "KICKBOXING",
    rounds: "5",
    roundTime: "3:00",
    red: { id: 18, name: "DOVYDAS LEVICKIS", photo: "dovydas-levickis.png" },
    blue: { id: 182, name: "MODESTAS ŽMUIDINA", photo: "modestas-zmuidina.png" },
  },
  {
    id: "main-31-23",
    card: "main",
    order: "#5",
    isMain: false,
    weight: "81 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 31, name: "TOMAS BANSKIS", photo: "tomas-banskis.png" },
    blue: { id: 23, name: "MANTVYDAS PEREDNIS", photo: "mantvydas-perednis.png" },
  },
  {
    id: "main-181-21",
    card: "main",
    order: "#6",
    isMain: false,
    weight: "81 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 181, name: "RIČARDAS KULIS", photo: "ricardas-kulis.png" },
    blue: { id: 21, name: "ISA GÖÇMEN", photo: "isa-gocmen.png" },
  },
  {
    id: "main-28-202",
    card: "main",
    order: "#7",
    isMain: false,
    weight: "81 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 28, name: "OSKARAS BUINICKAS", photo: "oskaras-buinickas.png" },
    blue: { id: 202, name: "RODRIGO MINEIRO", photo: null },
  },
  {
    id: "main-16-54",
    card: "main",
    order: "#8",
    isMain: false,
    weight: "81 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 16, name: "DEIVIDAS JEMELJANOVAS", photo: "deividas-jameljanovas.png" },
    blue: { id: 54, name: "ARNOLDAS MISIŪNAS", photo: "arnoldas-misiunas.png" },
  },
  {
    id: "prelim-101-61",
    card: "prelims",
    order: "#1",
    isMain: false,
    weight: "67 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 101, name: "DEIVIDAS DANYLA", photo: "deividas-danyla.png" },
    blue: { id: 61, name: "EVALDAS BALSYS", photo: "evaldas-balsys.png" },
  },
  {
    id: "prelim-59-25",
    card: "prelims",
    order: "#2",
    isMain: false,
    weight: "95 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 59, name: "IGNAS PAULIUKEVIČIUS", photo: "ignas-pauliukevicius.png" },
    blue: { id: 25, name: "MODESTAS JUODPUSIS", photo: "modestas-juodpusis.png" },
  },
  {
    id: "prelim-103-211",
    card: "prelims",
    order: "#3",
    isMain: false,
    weight: "75 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 103, name: "NAURIS LUKOŠIŪNAS", photo: "nauris-lukosiunas.png" },
    blue: { id: 211, name: "WOJCIECH KOSOWSKI", photo: null },
  },
  {
    id: "prelim-26-200",
    card: "prelims",
    order: "#4",
    isMain: false,
    weight: "91 KG",
    rules: "KICKBOXING",
    rounds: "3",
    roundTime: "3:00",
    red: { id: 26, name: "NAGLIS KANIŠAUSKAS", photo: "naglis-kanisauskas.png" },
    blue: { id: 200, name: "DOVYDAS GIRDZEVIČIUS", photo: "dovydas-girdzevicius.png" },
  },
];
