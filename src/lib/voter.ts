"use client";

import { useCallback, useSyncExternalStore } from "react";
import { event } from "@/data/event";

export type Voter = { id: string; name: string };

const KEY = `utma:voter:${event.id}`;
/** Fired on same-tab writes; `storage` only covers other tabs. */
const CHANGED = "utma:voter-changed";

type Snapshot = {
  /** False until hydration finishes, which distinguishes "no voter" from "not read yet". */
  ready: boolean;
  voter: Voter | null;
};

const serverSnapshot: Snapshot = { ready: false, voter: null };

let cachedRaw: string | null | undefined;
let cachedSnapshot: Snapshot = { ready: true, voter: null };

function parse(raw: string | null): Voter | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw);
    if (stored && typeof stored.id === "string" && typeof stored.name === "string") {
      return { id: stored.id, name: stored.name };
    }
  } catch {
    // ignore corrupt state and start fresh
  }
  return null;
}

/** Must return a stable reference while localStorage is unchanged. */
function getSnapshot(): Snapshot {
  const raw = window.localStorage.getItem(KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = { ready: true, voter: parse(raw) };
  }
  return cachedSnapshot;
}

function getServerSnapshot(): Snapshot {
  return serverSnapshot;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}

function write(voter: Voter | null) {
  if (voter) window.localStorage.setItem(KEY, JSON.stringify(voter));
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(CHANGED));
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `v-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function useVoter() {
  const { ready, voter } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const signIn = useCallback((rawName: string) => {
    const name = rawName.trim().slice(0, 28);
    if (!name) return;
    const current = parse(window.localStorage.getItem(KEY));
    write({ id: current?.id ?? createId(), name });
  }, []);

  const signOut = useCallback(() => write(null), []);

  return { voter, ready, signIn, signOut };
}
