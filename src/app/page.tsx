"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FightRow } from "@/components/FightRow";
import { Leaderboard } from "@/components/Leaderboard";
import { NameGate } from "@/components/NameGate";
import { cardSections, event, fights } from "@/data/event";
import type { Ballot, Pick } from "@/lib/ballots";
import {
  clearLocalBallots,
  deleteBallot,
  isPickComplete,
  saveName,
  savePick,
  subscribeToBallots,
} from "@/lib/ballots";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useHashFlag } from "@/lib/hash";
import { asset } from "@/lib/paths";
import { useVoter } from "@/lib/voter";

export default function Home() {
  const { voter, ready, signIn, signOut } = useVoter();
  const showReset = useHashFlag("reset");
  const [renaming, setRenaming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [ballots, setBallots] = useState<Ballot[]>([]);
  /** Picks shown before the write round-trips, so taps feel instant. */
  const [optimistic, setOptimistic] = useState<Record<string, Pick>>({});
  const [pendingFight, setPendingFight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeToBallots(setBallots), []);

  const mine = useMemo(
    () => (voter ? ballots.find((b) => b.voterId === voter.id) : undefined),
    [ballots, voter],
  );
  const remotePicks = useMemo(() => mine?.picks ?? {}, [mine]);

  /**
   * The overlay holds this device's latest intent, so it stays in place even after
   * the server echoes the write back. Entries are only dropped when a save fails.
   */
  const myPicks = useMemo(
    () => ({ ...remotePicks, ...optimistic }),
    [remotePicks, optimistic],
  );

  /** Everyone's ballots with my in-flight picks folded in, so the tallies stay honest. */
  const displayBallots = useMemo(() => {
    if (!voter) return ballots;
    const withoutMe = ballots.filter((b) => b.voterId !== voter.id);
    return [
      ...withoutMe,
      {
        voterId: voter.id,
        name: voter.name,
        updatedAt: mine?.updatedAt ?? 0,
        picks: myPicks,
      },
    ];
  }, [ballots, mine, myPicks, voter]);

  const handlePick = useCallback(
    async (fightId: string, pick: Pick) => {
      if (!voter) return;
      setOptimistic((current) => ({ ...current, [fightId]: pick }));
      setPendingFight(fightId);
      try {
        await savePick(voter, fightId, pick);
        setError(null);
      } catch (cause) {
        console.error("Failed to save pick", cause);
        setError("Nepavyko išsaugoti spėjimo. Patikrink interneto ryšį ir bandyk dar kartą.");
        setOptimistic((current) => {
          const next = { ...current };
          delete next[fightId];
          return next;
        });
      } finally {
        setPendingFight(null);
      }
    },
    [voter],
  );

  /** Wipes this device: my ballot, the localStorage fallback store and my name. */
  const handleReset = useCallback(async () => {
    if (!window.confirm("Ištrinti šio įrenginio spėjimus ir vardą?")) return;
    setResetting(true);
    try {
      if (voter) await deleteBallot(voter.id);
      clearLocalBallots();
      setOptimistic({});
      setError(null);
      signOut();
    } catch (cause) {
      console.error("Failed to reset", cause);
      setError("Nepavyko išvalyti duomenų. Bandyk dar kartą.");
    } finally {
      setResetting(false);
    }
  }, [signOut, voter]);

  const completed = fights.filter((fight) => isPickComplete(myPicks[fight.id])).length;
  const percent = Math.round((completed / fights.length) * 100);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <span className="utma-pulse h-3 w-3 rounded-full bg-acid" />
      </div>
    );
  }

  if (!voter || renaming) {
    return (
      <NameGate
        initialName={voter?.name ?? ""}
        onCancel={voter ? () => setRenaming(false) : undefined}
        onSubmit={(name) => {
          signIn(name);
          setRenaming(false);
          if (voter) saveName({ id: voter.id, name }).catch(() => {});
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-24 sm:px-6">
      <header className="pt-8 sm:pt-12">
        <div className="flex items-start justify-between gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/brand/utma-logo.svg")} alt="UTMA" className="h-auto w-[86px]" />
          <button
            type="button"
            onClick={() => setRenaming(true)}
            className="label cursor-pointer rounded-lg border border-line bg-surface px-3 py-2 text-[9px] text-muted transition hover:border-acid/50 hover:text-acid"
          >
            {voter.name} · keisti
          </button>
        </div>

        <p className="label mt-7 text-[10px] text-acid">{event.name} · {event.tagline}</p>
        <h1 className="mt-2 text-[38px] leading-[0.92] font-semibold uppercase sm:text-[54px]">
          Spėk kovų
          <br />
          nugalėtojus
        </h1>
        <p className="mt-3 max-w-[46ch] text-[14px] leading-snug font-light text-muted">
          Pasirink, kas nugalės kiekvieną kovą, kaip iškovos pergalę — nokautu ar
          taškais — ir nokauto atveju, kuriame raunde.
        </p>

        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {[
            ["Data", event.date],
            ["Vieta", event.venue],
          ].map(([term, value]) => (
            <div key={term}>
              <dt className="label text-[8px] text-muted/60">{term}</dt>
              <dd className="text-[13px] font-medium tracking-wide uppercase">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={event.ticketsUrl}
            target="_blank"
            rel="noreferrer"
            className="label rounded-lg bg-acid px-4 py-2.5 text-[10px] text-ink transition hover:brightness-110"
          >
            Bilietai
          </a>
          <Link
            href="/spejimai"
            className="label rounded-lg border border-line bg-surface px-4 py-2.5 text-[10px] text-muted transition hover:border-acid/50 hover:text-acid"
          >
            Visi spėjimai
          </Link>
          <a
            href={event.fightcardUrl}
            target="_blank"
            rel="noreferrer"
            className="label rounded-lg border border-line bg-surface px-4 py-2.5 text-[10px] text-muted transition hover:border-acid/50 hover:text-acid"
          >
            Oficiali korta
          </a>
        </div>
      </header>

      <section className="mt-10 rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label text-[9px] text-muted/60">Tavo progresas</p>
            <p className="mt-1 text-[22px] leading-none font-semibold">
              {completed}
              <span className="text-muted">/{fights.length}</span>
            </p>
          </div>
          <p className="label text-right text-[9px] text-muted">
            {completed === fights.length ? "Korta užpildyta" : "Užbaik visus spėjimus"}
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <span
            className="block h-full bg-acid transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      {error && (
        <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] font-light text-danger">
          {error}
        </p>
      )}

      {!isFirebaseConfigured && (
        <p className="label mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-[9px] leading-relaxed text-muted/70">
          Firebase nesukonfigūruotas — spėjimai saugomi tik šioje naršyklėje.
        </p>
      )}

      <main className="mt-8">
        {cardSections.map((section, sectionIndex) => {
          const sectionFights = fights.filter((fight) => fight.card === section.id);
          return (
            <section key={section.id} className={sectionIndex === 0 ? "" : "mt-10"}>
              <header className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="label text-[10px] text-acid">{section.label}</p>
                  <h2 className="text-[24px] leading-none font-semibold uppercase sm:text-[28px]">
                    Kovos
                  </h2>
                </div>
                {sectionIndex === 0 && (
                  <a href="#spejejai" className="label text-[9px] text-muted transition hover:text-acid">
                    Spėjėjai ↓
                  </a>
                )}
              </header>

              <div className="grid gap-3">
                {sectionFights.map((fight, index) => (
                  <FightRow
                    key={fight.id}
                    fight={fight}
                    index={index}
                    myPick={myPicks[fight.id]}
                    ballots={displayBallots}
                    pending={pendingFight === fight.id}
                    onPick={(pick) => handlePick(fight.id, pick)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <div className="mt-12">
        <Leaderboard ballots={displayBallots} myId={voter.id} />
      </div>

      <footer className="mt-14 border-t border-line pt-6">
        <p className="text-[11px] leading-relaxed font-light text-muted/70">
          Neoficialus, fanų sukurtas spėjimų žaidimas. Kovų duomenys —{" "}
          <a href={event.fightcardUrl} target="_blank" rel="noreferrer" className="text-acid">
            stats.uniquetma.com
          </a>
          .
        </p>

        {showReset && (
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="label mt-4 cursor-pointer rounded-lg border border-danger/40 px-3.5 py-2 text-[9px] text-danger transition hover:bg-danger/10 disabled:cursor-wait disabled:opacity-60"
          >
            {resetting ? "Valoma…" : "Išvalyti šio įrenginio duomenis"}
          </button>
        )}
      </footer>
    </div>
  );
}
