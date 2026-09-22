"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fights } from "@/data/event";
import type { Ballot } from "@/lib/ballots";
import { deleteBallot, isPickComplete, subscribeToBallots } from "@/lib/ballots";
import { isFirebaseConfigured } from "@/lib/firebase";

/**
 * Build-time passcode. It only keeps the page out of reach of someone who
 * stumbles on the URL — anyone can read it out of the bundle, and the database
 * rules already allow unauthenticated writes. See README for the real fix.
 */
const adminCode = process.env.NEXT_PUBLIC_ADMIN_CODE ?? "";

const fightById = new Map(fights.map((fight) => [fight.id, fight]));

function pickSummary(ballot: Ballot, fightId: string): string | null {
  const fight = fightById.get(fightId);
  const pick = ballot.picks[fightId];
  if (!fight || !pick) return null;
  const fighter = pick.corner === "red" ? fight.red : fight.blue;
  const method =
    pick.method === "ko" ? (pick.round ? `KO ${pick.round} r.` : "KO (be raundo)") : null;
  return `${fight.order} · ${fighter.name}${method ? ` · ${method}` : pick.method === "points" ? " · Taškai" : " · be būdo"}`;
}

function CodeGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);

  if (!adminCode) {
    return (
      <p className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] font-light text-danger">
        Admin kodas nesukonfigūruotas — nustatyk NEXT_PUBLIC_ADMIN_CODE ir perstatyk projektą.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim() === adminCode) onUnlock();
        else setWrong(true);
      }}
      className="rounded-2xl border border-line bg-surface p-6"
    >
      <label className="label block text-[10px] text-muted" htmlFor="admin-code">
        Admin kodas
      </label>
      <input
        id="admin-code"
        type="password"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setWrong(false);
        }}
        autoFocus
        autoComplete="off"
        className="mt-2 w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-[16px] tracking-wide text-text focus:border-acid focus:outline-none"
      />
      {wrong && <p className="mt-2 text-[12px] font-light text-danger">Neteisingas kodas.</p>}
      <button
        type="submit"
        disabled={!code.trim()}
        className="label mt-4 w-full cursor-pointer rounded-xl bg-acid py-3 text-[12px] text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
      >
        Atidaryti
      </button>
    </form>
  );
}

export function AdminPanel() {
  const [unlocked, setUnlocked] = useState(false);
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!unlocked) return;
    return subscribeToBallots(setBallots);
  }, [unlocked]);

  const rows = useMemo(
    () =>
      [...ballots]
        .map((ballot) => ({
          ...ballot,
          complete: Object.values(ballot.picks).filter(isPickComplete).length,
          total: Object.keys(ballot.picks).length,
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [ballots],
  );

  const remove = async (voterId: string, name: string) => {
    if (!window.confirm(`Ištrinti „${name}“ spėjimus?`)) return;
    setBusy(voterId);
    try {
      await deleteBallot(voterId);
      setError(null);
    } catch (cause) {
      console.error("Failed to delete ballot", cause);
      setError(`Nepavyko ištrinti „${name}“.`);
    } finally {
      setBusy(null);
    }
  };

  const removeAll = async () => {
    if (!window.confirm(`Ištrinti visų ${rows.length} žaidėjų spėjimus? Veiksmas neatšaukiamas.`))
      return;
    setBusy("all");
    try {
      // Rules allow deletes per voter, not on the whole event node.
      for (const row of rows) await deleteBallot(row.voterId);
      setError(null);
    } catch (cause) {
      console.error("Failed to delete all ballots", cause);
      setError("Nepavyko ištrinti visų spėjimų.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="label text-[10px] text-acid">Admin</p>
        <h1 className="mt-1.5 text-[30px] leading-none font-semibold uppercase">Spėjimų valdymas</h1>
        <Link
          href="/"
          className="label mt-4 inline-block text-[9px] text-muted transition hover:text-acid"
        >
          ← Į spėjimų puslapį
        </Link>
      </header>

      {!unlocked ? (
        <CodeGate onUnlock={() => setUnlocked(true)} />
      ) : (
        <>
          {!isFirebaseConfigured && (
            <p className="label mb-4 rounded-xl border border-line bg-surface px-4 py-3 text-[9px] text-muted/70">
              Firebase nesukonfigūruotas — rodomi tik šios naršyklės duomenys.
            </p>
          )}

          {error && (
            <p className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] font-light text-danger">
              {error}
            </p>
          )}

          <div className="mb-3 flex items-end justify-between gap-4">
            <p className="label text-[10px] text-muted">
              {rows.length} {rows.length === 1 ? "žaidėjas" : "žaidėjai"}
            </p>
            {rows.length > 0 && (
              <button
                type="button"
                onClick={removeAll}
                disabled={busy !== null}
                className="label cursor-pointer rounded-lg border border-danger/40 px-3 py-2 text-[9px] text-danger transition hover:bg-danger/10 disabled:cursor-wait disabled:opacity-60"
              >
                {busy === "all" ? "Valoma…" : "Ištrinti visus"}
              </button>
            )}
          </div>

          {rows.length === 0 ? (
            <p className="rounded-2xl border border-line bg-surface p-5 text-[13px] font-light text-muted">
              Spėjimų nėra.
            </p>
          ) : (
            <ul className="grid gap-2">
              {rows.map((row) => (
                <li key={row.voterId} className="rounded-xl border border-line bg-surface p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-medium uppercase">{row.name}</p>
                      <p className="label mt-1 text-[9px] text-muted">
                        {row.complete}/{fights.length} užbaigta
                        {row.total > row.complete ? ` · ${row.total - row.complete} be būdo` : ""}
                        {row.updatedAt
                          ? ` · ${new Date(row.updatedAt).toLocaleString("lt-LT")}`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(row.voterId, row.name)}
                      disabled={busy !== null}
                      className="label flex-none cursor-pointer rounded-lg border border-danger/40 px-3 py-2 text-[9px] text-danger transition hover:bg-danger/10 disabled:cursor-wait disabled:opacity-60"
                    >
                      {busy === row.voterId ? "…" : "Ištrinti"}
                    </button>
                  </div>

                  <details className="mt-2.5">
                    <summary className="label cursor-pointer text-[9px] text-muted/60 transition hover:text-acid">
                      Spėjimai
                    </summary>
                    <ul className="mt-2 grid gap-1">
                      {fights.map((fight) => {
                        const summary = pickSummary(row, fight.id);
                        return summary ? (
                          <li key={fight.id} className="text-[12px] font-light text-muted">
                            {summary}
                          </li>
                        ) : null;
                      })}
                    </ul>
                    <p className="label mt-2 text-[8px] text-muted/40">ID: {row.voterId}</p>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
