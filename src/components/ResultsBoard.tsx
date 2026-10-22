"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { NameGate } from "@/components/NameGate";
import type { CardSection, EventMeta, Fight } from "@/data/event";
import type { FightResult } from "@/data/results";
import type { Ballot } from "@/lib/ballots";
import { subscribeToBallots } from "@/lib/ballots";
import { splitFighterName } from "@/lib/guesses";
import { asset } from "@/lib/paths";
import type { ScoreLine } from "@/lib/scoring";
import { maxPoints, rankBallots } from "@/lib/scoring";
import { usePastVoterId, useVoter } from "@/lib/voter";

export type ResultsBoardProps = {
  event: EventMeta;
  cardSections: CardSection[];
  fights: Fight[];
  results: Record<string, FightResult>;
  /** A finished event: read-only, no name gate, and nothing to link onward to. */
  archived?: boolean;
};

/** Last name in the serif italic, first name as the small label above it. */
function FighterName({ name, tone }: { name: string; tone: "acid" | "text" | "muted" }) {
  const { firstName, lastName } = splitFighterName(name);
  const colour =
    tone === "acid" ? "text-acid" : tone === "muted" ? "text-muted/40" : "text-text";
  return (
    <>
      {firstName && <p className="label text-[8px] text-muted/50">{firstName}</p>}
      <p className={`last-name mt-0.5 text-[15px] leading-snug ${colour}`}>{lastName}</p>
    </>
  );
}

function PointsBadge({ points, max }: { points: number; max: number }) {
  const tone =
    points === max
      ? "border-acid/50 bg-acid/10 text-acid"
      : points > 0
        ? "border-line bg-surface-2 text-text"
        : "border-line/60 bg-transparent text-muted/40";
  return (
    <span
      className={`label flex-none rounded-lg border px-2 py-1 text-[9px] tabular-nums ${tone}`}
      title={`${points} iš ${max}`}
    >
      +{points}
    </span>
  );
}

function BreakdownRow({ line }: { line: ScoreLine }) {
  return (
    <li className="flex items-start gap-3 border-t border-line/70 pt-2.5 first:border-t-0 first:pt-0">
      <span className="label w-12 flex-none pt-0.5 text-[8px] text-muted/60">{line.order}</span>

      <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className="label text-[8px] text-muted/40">Spėjo</p>
          {line.pickedName ? (
            <FighterName name={line.pickedName} tone={line.winnerCorrect ? "text" : "muted"} />
          ) : (
            <p className="mt-0.5 text-[15px] leading-snug text-muted/40">—</p>
          )}
          <p className="label mt-0.5 text-[8px] text-muted/60">{line.pickedMethodLabel ?? ""}</p>
        </div>

        <div className="min-w-0">
          <p className="label text-[8px] text-muted/40">Laimėjo</p>
          <FighterName name={line.winnerName} tone="acid" />
          <p className="label mt-0.5 text-[8px] text-muted/60">{line.resultLabel}</p>
        </div>
      </div>

      <PointsBadge points={line.points} max={line.max} />
    </li>
  );
}

export function ResultsBoard({
  event,
  cardSections,
  fights,
  results,
  archived = false,
}: ResultsBoardProps) {
  const { voter, ready, signIn } = useVoter();
  const [ballots, setBallots] = useState<Ballot[]>([]);
  /** Who this device was during the archived event — only used to mark your own row. */
  const pastVoterId = usePastVoterId(archived ? event.id : null);

  useEffect(() => subscribeToBallots(event.id, setBallots), [event.id]);

  const scoredFights = useMemo(
    () => fights.filter((fight) => results[fight.id]),
    [fights, results],
  );
  const perfectScore = useMemo(
    () => scoredFights.reduce((sum, fight) => sum + maxPoints(results[fight.id]), 0),
    [scoredFights, results],
  );
  const rows = useMemo(() => rankBallots(ballots, fights, results), [ballots, fights, results]);

  const cardLabel = (card: string) =>
    cardSections.find((section) => section.id === card)?.label ?? card;
  const myVoterId = archived ? pastVoterId : (voter?.id ?? null);

  if (!archived && !ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <span className="utma-pulse h-3 w-3 rounded-full bg-acid" />
      </div>
    );
  }

  if (!archived && !voter) {
    return <NameGate onSubmit={signIn} />;
  }

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-24 sm:px-6">
      <header className="pt-8 sm:pt-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/brand/utma-logo.svg")} alt="UTMA" className="h-auto w-[86px]" />
        <p className="label mt-7 text-[10px] text-acid">
          {event.name} · {archived ? "ARCHYVAS" : event.tagline}
        </p>
        <h1 className="mt-2 text-[38px] leading-[0.92] font-semibold uppercase sm:text-[54px]">
          Kas
          <br />
          atspėjo
        </h1>
        <p className="mt-3 max-w-[46ch] text-[14px] leading-snug font-light text-muted">
          {scoredFights.length === 0
            ? "Kol kas nė viena kova neįvertinta. Lentelė pildysis kovų vakarą: 1 taškas už nugalėtoją, dar 1 už pergalės būdą ir dar 1 už nokauto raundą."
            : `Taškai už kiekvieną kovą: 1 už nugalėtoją, dar 1 už pergalės būdą ir dar 1 už nokauto raundą. Iš viso galima surinkti ${perfectScore}.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/" className="label text-[9px] text-muted transition hover:text-acid">
            ← Į kortą
          </Link>
          {!archived && (
            <>
              <Link
                href="/spejimai"
                className="label text-[9px] text-muted transition hover:text-acid"
              >
                Visi spėjimai →
              </Link>
              <Link
                href="/archyvas/utma-19"
                className="label text-[9px] text-muted transition hover:text-acid"
              >
                UTMA #19 →
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mt-10">
        <header className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="label text-[10px] text-acid">Suvestinė</p>
            <h2 className="text-[24px] leading-none font-semibold uppercase sm:text-[28px]">
              Lentelė
            </h2>
          </div>
          <p className="label flex-none text-[10px] whitespace-nowrap text-muted">
            {rows.length} {rows.length === 1 ? "žaidėjas" : "žaidėjai"}
          </p>
        </header>

        {scoredFights.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface p-5 text-[13px] font-light text-muted">
            Lentelė atsiras, kai bus paskelbti pirmieji kovų rezultatai.
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface p-5 text-[13px] font-light text-muted">
            Niekas nespėjo šio turnyro.
          </p>
        ) : (
          <ul className="grid gap-3">
            {rows.map((row) => {
              const isMe = row.voterId === myVoterId;
              const isWinner = row.rank === 1;
              return (
                <li
                  key={row.voterId}
                  className={[
                    "rounded-2xl border p-4 sm:p-5",
                    isWinner
                      ? "border-acid/60 bg-acid/5"
                      : isMe
                        ? "border-acid/45 bg-surface-2"
                        : "border-line bg-surface",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        "label w-7 flex-none text-[11px] tabular-nums",
                        isWinner ? "text-acid" : "text-muted/50",
                      ].join(" ")}
                    >
                      {String(row.rank).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="min-w-0 truncate text-[20px] leading-none font-semibold uppercase sm:text-[24px]">
                        {row.name}
                        {isMe && <span className="label ml-2 text-[9px] text-acid">Tu</span>}
                      </h3>
                      <p className="label mt-1.5 text-[9px] text-muted">
                        {row.winners}/{row.lines.length} nugalėtojų
                      </p>
                    </div>

                    <p className="flex-none text-right text-[26px] leading-none font-semibold tabular-nums sm:text-[32px]">
                      {row.total}
                      <span className="text-[14px] text-muted">/{perfectScore}</span>
                    </p>
                  </div>

                  <details className="mt-3">
                    <summary className="label cursor-pointer text-[9px] text-muted/60 transition hover:text-acid">
                      Kovos po vieną
                    </summary>
                    <ul className="mt-3 grid gap-2.5">
                      {row.lines.map((line, index, lines) => (
                        <Fragment key={line.fightId}>
                          {line.card !== lines[index - 1]?.card && (
                            <li className="label text-[8px] text-acid">{cardLabel(line.card)}</li>
                          )}
                          <BreakdownRow line={line} />
                        </Fragment>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {scoredFights.length > 0 && (
        <section className="mt-12">
          <header className="mb-3">
            <p className="label text-[10px] text-acid">Oficialu</p>
            <h2 className="text-[24px] leading-none font-semibold uppercase sm:text-[28px]">
              Kovų rezultatai
            </h2>
          </header>
          <ul className="grid gap-2">
            {scoredFights.map((fight) => {
              const result = results[fight.id];
              const winner = result.winner === "red" ? fight.red : fight.blue;
              const loser = result.winner === "red" ? fight.blue : fight.red;
              return (
                <li
                  key={fight.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3"
                >
                  <span className="label w-16 flex-none text-[8px] text-muted/50">
                    {fight.card === "prelims" ? "PRELIMS " : ""}
                    {fight.order}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px]">
                    <span className="last-name text-acid">{splitFighterName(winner.name).lastName}</span>
                    <span className="label mx-2 text-[8px] text-muted/50">nug.</span>
                    <span className="text-muted/60">{splitFighterName(loser.name).lastName}</span>
                  </span>
                  <span className="label flex-none text-[9px] text-muted">
                    {result.method === "ko" ? `${result.label} ${result.round} r.` : result.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <footer className="mt-14 border-t border-line pt-6">
        <p className="text-[11px] leading-relaxed font-light text-muted/70">
          Rezultatai iš{" "}
          <a href={event.fightcardUrl} target="_blank" rel="noreferrer" className="text-acid">
            stats.uniquetma.com
          </a>
          . Neužbaigtas spėjimas vis tiek neša tašką už teisingai atspėtą nugalėtoją.
        </p>
      </footer>
    </div>
  );
}
