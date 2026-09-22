"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NameGate } from "@/components/NameGate";
import { event, fights } from "@/data/event";
import type { Ballot } from "@/lib/ballots";
import { isPickComplete, subscribeToBallots } from "@/lib/ballots";
import { guessLines, sortGuessBallots } from "@/lib/guesses";
import { asset } from "@/lib/paths";
import { useVoter } from "@/lib/voter";

export function GuessesBoard() {
  const { voter, ready, signIn } = useVoter();
  const [ballots, setBallots] = useState<Ballot[]>([]);

  useEffect(() => subscribeToBallots(setBallots), []);

  const rows = useMemo(
    () => (voter ? sortGuessBallots(ballots, voter.id) : []),
    [ballots, voter],
  );

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <span className="utma-pulse h-3 w-3 rounded-full bg-acid" />
      </div>
    );
  }

  if (!voter) {
    return <NameGate onSubmit={signIn} />;
  }

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-24 sm:px-6">
      <header className="pt-8 sm:pt-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/brand/utma-logo.svg")} alt="UTMA" className="h-auto w-[86px]" />
        <p className="label mt-7 text-[10px] text-acid">
          {event.name} · {event.tagline}
        </p>
        <h1 className="mt-2 text-[38px] leading-[0.92] font-semibold uppercase sm:text-[54px]">
          Visi
          <br />
          spėjimai
        </h1>
        <Link
          href="/"
          className="label mt-4 inline-block text-[9px] text-muted transition hover:text-acid"
        >
          ← Į kortą
        </Link>
      </header>

      <section className="mt-10">
        <header className="mb-3 flex items-end justify-between gap-4">
          <p className="label text-[10px] text-muted">
            {rows.length} {rows.length === 1 ? "žaidėjas" : "žaidėjai"}
          </p>
        </header>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface p-5 text-[13px] font-light text-muted">
            Kol kas spėjimų nėra. Būk pirmas ir pasidalink nuoroda su draugais.
          </p>
        ) : (
          <ul className="grid gap-3">
            {rows.map((ballot) => {
              const isMe = ballot.voterId === voter.id;
              const complete = Object.values(ballot.picks).filter(isPickComplete).length;
              return (
                <li
                  key={ballot.voterId}
                  className={[
                    "rounded-2xl border p-4 sm:p-5",
                    isMe ? "border-acid/45 bg-surface-2" : "border-line bg-surface",
                  ].join(" ")}
                >
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <h2 className="min-w-0 truncate text-[20px] leading-none font-semibold uppercase sm:text-[24px]">
                        {ballot.name}
                      </h2>
                      {isMe && <span className="label flex-none text-[9px] text-acid">Tu</span>}
                    </div>
                    <p className="label flex-none text-[10px] text-muted">
                      {complete}/{fights.length}
                    </p>
                  </div>

                  <ul className="mt-4 grid gap-2.5">
                    {guessLines(ballot, fights).map((line) => (
                      <li
                        key={line.fightId}
                        className="flex items-baseline justify-between gap-3 border-t border-line/70 pt-2.5 first:border-t-0 first:pt-0"
                      >
                        <div className="min-w-0">
                          <p className="label text-[8px] text-muted/60">{line.order}</p>
                          <p
                            className={[
                              "mt-0.5 text-[14px] leading-snug font-medium uppercase",
                              line.winner ? "text-text" : "text-muted/40",
                            ].join(" ")}
                          >
                            {line.winner ?? "—"}
                          </p>
                        </div>
                        <p className="label flex-none text-[9px] text-muted">
                          {line.methodLabel ?? ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
