import type { Corner } from "@/data/event";
import { event } from "@/data/event";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";

/** "ko" covers KO/TKO, "points" covers any decision on the scorecards. */
export type Method = "ko" | "points";

export type Pick = {
  corner: Corner;
  method: Method | null;
  /** 1-based round, only meaningful when method === "ko" */
  round: number | null;
};

export type Ballot = {
  voterId: string;
  name: string;
  updatedAt: number;
  picks: Record<string, Pick>;
};

type RawBallot = {
  name?: unknown;
  updatedAt?: unknown;
  picks?: unknown;
};

const LOCAL_KEY = `utma:ballots:${event.id}`;
const LOCAL_EVENT = "utma:ballots-changed";

/** A pick only counts once the victory type — and the round behind a KO — is known. */
export function isPickComplete(pick: Pick | undefined): boolean {
  if (!pick) return false;
  if (pick.method === "points") return true;
  return pick.method === "ko" && typeof pick.round === "number";
}

function normalisePick(value: unknown): Pick | null {
  // Ballots cast before victory types existed stored the corner as a bare string.
  if (value === "red" || value === "blue") return { corner: value, method: null, round: null };
  if (!value || typeof value !== "object") return null;

  const raw = value as { corner?: unknown; method?: unknown; round?: unknown };
  if (raw.corner !== "red" && raw.corner !== "blue") return null;

  const method = raw.method === "ko" || raw.method === "points" ? raw.method : null;
  const round =
    method === "ko" && typeof raw.round === "number" && raw.round >= 1 ? raw.round : null;

  return { corner: raw.corner, method, round };
}

function normalise(voterId: string, raw: RawBallot): Ballot | null {
  if (typeof raw?.name !== "string" || !raw.name.trim()) return null;
  const picks: Record<string, Pick> = {};
  if (raw.picks && typeof raw.picks === "object") {
    for (const [fightId, value] of Object.entries(raw.picks as Record<string, unknown>)) {
      const pick = normalisePick(value);
      if (pick) picks[fightId] = pick;
    }
  }
  return {
    voterId,
    name: raw.name.trim(),
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
    picks,
  };
}

function toBallots(value: unknown): Ballot[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, RawBallot>)
    .map(([voterId, raw]) => normalise(voterId, raw))
    .filter((b): b is Ballot => b !== null)
    .sort((a, b) => a.updatedAt - b.updatedAt);
}

/** Realtime Database drops keys set to null, so only send what we actually know. */
function toRaw(pick: Pick) {
  return {
    corner: pick.corner,
    ...(pick.method ? { method: pick.method } : {}),
    ...(pick.method === "ko" && pick.round ? { round: pick.round } : {}),
  };
}

function readLocal(): Record<string, RawBallot> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeLocal(all: Record<string, RawBallot>) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

/**
 * Streams every ballot for the event. Falls back to localStorage when Firebase
 * env vars are absent, so the app is fully usable before the project is wired up.
 */
export function subscribeToBallots(onChange: (ballots: Ballot[]) => void): () => void {
  if (!isFirebaseConfigured) {
    const emit = () => onChange(toBallots(readLocal()));
    emit();
    // `storage` covers other tabs, the custom event covers this one.
    window.addEventListener("storage", emit);
    window.addEventListener(LOCAL_EVENT, emit);
    return () => {
      window.removeEventListener("storage", emit);
      window.removeEventListener(LOCAL_EVENT, emit);
    };
  }

  let detach: (() => void) | undefined;
  let cancelled = false;

  (async () => {
    const [db, { ref, onValue }] = await Promise.all([getDb(), import("firebase/database")]);
    if (cancelled) return;
    detach = onValue(
      ref(db, `predictions/${event.id}`),
      (snapshot) => onChange(toBallots(snapshot.val())),
      (error) => console.error("Failed to read predictions", error),
    );
  })().catch((error) => console.error("Failed to subscribe to predictions", error));

  return () => {
    cancelled = true;
    detach?.();
  };
}

export async function savePick(
  voter: { id: string; name: string },
  fightId: string,
  pick: Pick,
): Promise<void> {
  if (!isFirebaseConfigured) {
    const all = readLocal();
    const existing = all[voter.id];
    const picks =
      existing?.picks && typeof existing.picks === "object"
        ? (existing.picks as Record<string, unknown>)
        : {};
    all[voter.id] = {
      name: voter.name,
      updatedAt: Date.now(),
      picks: { ...picks, [fightId]: toRaw(pick) },
    };
    writeLocal(all);
    return;
  }

  const [db, { ref, update, serverTimestamp }] = await Promise.all([
    getDb(),
    import("firebase/database"),
  ]);
  // Writing the whole pick object replaces it, so a switch to "points" clears the round.
  await update(ref(db, `predictions/${event.id}/${voter.id}`), {
    name: voter.name,
    updatedAt: serverTimestamp(),
    [`picks/${fightId}`]: toRaw(pick),
  });
}

/** Drops the whole localStorage fallback store, including pre-Firebase leftovers. */
export function clearLocalBallots(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_KEY);
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

export async function deleteBallot(voterId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    const all = readLocal();
    delete all[voterId];
    writeLocal(all);
    return;
  }

  const [db, { ref, remove }] = await Promise.all([getDb(), import("firebase/database")]);
  await remove(ref(db, `predictions/${event.id}/${voterId}`));
}

export async function saveName(voter: { id: string; name: string }): Promise<void> {
  if (!isFirebaseConfigured) {
    const all = readLocal();
    if (!all[voter.id]) return;
    all[voter.id] = { ...all[voter.id], name: voter.name };
    writeLocal(all);
    return;
  }

  const [db, { ref, update }] = await Promise.all([getDb(), import("firebase/database")]);
  await update(ref(db, `predictions/${event.id}/${voter.id}`), { name: voter.name });
}
