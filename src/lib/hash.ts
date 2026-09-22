"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/**
 * Reveals controls that should stay out of the way of players — append the
 * fragment to the URL (e.g. `/#reset`) to switch one on. Server-rendered as
 * false, since the fragment never reaches the server.
 */
export function useHashFlag(flag: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash === `#${flag}`,
    () => false,
  );
}
