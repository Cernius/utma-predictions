"use client";

import { useMemo } from "react";
import type { Ballot, Method, Pick } from "@/lib/ballots";
import { isPickComplete } from "@/lib/ballots";
import type { Corner, Fight, Fighter } from "@/data/event";
import { roundOptions } from "@/data/event";
import { asset } from "@/lib/paths";

type Props = {
  fight: Fight;
  index: number;
  myPick: Pick | undefined;
  ballots: Ballot[];
  pending: boolean;
  onPick: (pick: Pick) => void;
};

/** Acid for the left corner, bone-white for the right — keeps the two-tone brand palette. */
const cornerTone: Record<Corner, { text: string; bar: string; border: string; chip: string }> = {
  red: {
    text: "text-acid",
    bar: "bg-acid",
    border: "border-acid",
    chip: "border-acid/40 bg-acid/10 text-acid",
  },
  blue: {
    text: "text-text",
    bar: "bg-text",
    border: "border-text",
    chip: "border-text/30 bg-text/10 text-text",
  },
};

const methodLabel: Record<Method, string> = { ko: "Nokautu", points: "Taškais" };

/** Short form for the crowd chips: "KO 2" / "TAŠKAI". */
function pickSummary(pick: Pick): string {
  if (pick.method === "ko") return pick.round ? `KO ${pick.round} R.` : "KO";
  if (pick.method === "points") return "TAŠKAI";
  return "?";
}

function photoSrc(fighter: Fighter) {
  return asset(`/fighters/${fighter.photo ?? "shadow.png"}`);
}

function FighterButton({
  fighter,
  corner,
  fight,
  selected,
  revealed,
  percent,
  votes,
  disabled,
  onPick,
}: {
  fighter: Fighter;
  corner: Corner;
  fight: Fight;
  selected: boolean;
  revealed: boolean;
  percent: number;
  votes: number;
  disabled: boolean;
  onPick: () => void;
}) {
  const tone = cornerTone[corner];
  const right = corner === "blue";

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Spėti, kad nugalės ${fighter.name}`}
      className={[
        "group relative flex min-w-0 flex-1 cursor-pointer items-end gap-3 overflow-hidden rounded-xl border p-3 text-left transition disabled:cursor-wait",
        right ? "flex-row-reverse text-right" : "",
        selected ? `${tone.border} bg-surface-2` : "border-line bg-surface-2/40 hover:border-muted/60",
      ].join(" ")}
    >
      {revealed && (
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-y-0 transition-[width] duration-700 ease-out",
            right ? "right-0" : "left-0",
            selected ? "opacity-[0.13]" : "opacity-[0.07]",
            tone.bar,
          ].join(" ")}
          style={{ width: `${percent}%` }}
        />
      )}

      <span className="relative grid h-[68px] w-[54px] flex-none place-items-end justify-center overflow-hidden rounded-lg bg-[#22282b]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc(fighter)}
          alt={fighter.name}
          loading={fight.isMain ? "eager" : "lazy"}
          className={[
            "h-full w-full object-contain object-bottom transition duration-300",
            fighter.photo ? "" : "opacity-25",
            selected ? "" : "grayscale group-hover:grayscale-0",
          ].join(" ")}
        />
      </span>

      <span className="relative min-w-0 flex-1">
        <span
          className={[
            "block text-[15px] leading-[1.1] font-semibold uppercase transition sm:text-[17px]",
            selected ? tone.text : "text-text group-hover:text-acid",
          ].join(" ")}
        >
          {fighter.name}
        </span>

        {revealed ? (
          <span className={`label mt-1.5 block text-[10px] ${selected ? tone.text : "text-muted"}`}>
            {percent}% · {votes} {votes === 1 ? "balsas" : "balsai"}
          </span>
        ) : (
          <span className="label mt-1.5 block text-[9px] text-muted/70">Spėk nugalėtoją</span>
        )}

        {selected && (
          <span className={`label mt-2 inline-block rounded bg-acid px-1.5 py-0.5 text-[8px] text-ink`}>
            Tavo spėjimas
          </span>
        )}
      </span>
    </button>
  );
}

function StepChip({
  active,
  disabled,
  label,
  onClick,
  wide,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={[
        "label cursor-pointer rounded-lg border py-2 text-[10px] transition disabled:cursor-wait",
        wide ? "flex-1 px-4" : "min-w-[38px] px-2.5",
        active
          ? "border-acid bg-acid text-ink"
          : "border-line bg-surface-2 text-muted hover:border-muted/60 hover:text-text",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function FightRow({ fight, index, myPick, ballots, pending, onPick }: Props) {
  const tally = useMemo(() => {
    let red = 0;
    let blue = 0;
    let ko = 0;
    let points = 0;
    const rounds = new Map<number, number>();
    const crowd: Record<Corner, { name: string; summary: string }[]> = { red: [], blue: [] };

    for (const ballot of ballots) {
      const pick = ballot.picks[fight.id];
      if (!pick) continue;
      if (pick.corner === "red") red += 1;
      else blue += 1;
      if (pick.method === "ko") {
        ko += 1;
        if (pick.round) rounds.set(pick.round, (rounds.get(pick.round) ?? 0) + 1);
      } else if (pick.method === "points") {
        points += 1;
      }
      crowd[pick.corner].push({ name: ballot.name, summary: pickSummary(pick) });
    }

    const topRound = [...rounds.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
    const total = red + blue;
    const redPercent = total ? Math.round((red / total) * 100) : 50;

    return {
      red,
      blue,
      ko,
      points,
      topRound: topRound?.[0] ?? null,
      total,
      redPercent,
      bluePercent: total ? 100 - redPercent : 50,
      crowd,
    };
  }, [ballots, fight.id]);

  const complete = isPickComplete(myPick);
  const facts = [
    ["Svoris", fight.weight],
    ["Taisyklės", fight.rules],
    ["Raundai", `${fight.rounds} × ${fight.roundTime}`],
  ] as const;

  /** Keeps the round when re-picking a corner, so a mis-tap costs one tap to fix. */
  const pickCorner = (corner: Corner) =>
    onPick({ corner, method: myPick?.method ?? null, round: myPick?.round ?? null });

  const pickMethod = (method: Method) => {
    if (!myPick) return;
    onPick({ corner: myPick.corner, method, round: method === "ko" ? myPick.round : null });
  };

  const pickRound = (round: number) => {
    if (!myPick) return;
    onPick({ corner: myPick.corner, method: "ko", round });
  };

  return (
    <article
      id={fight.id}
      className={[
        "utma-rise scroll-mt-24 rounded-2xl border p-3.5 sm:p-4",
        fight.isMain ? "border-acid/35 bg-ink" : "border-line bg-surface",
      ].join(" ")}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              "label rounded px-2 py-1 text-[9px]",
              fight.isMain ? "bg-acid text-ink" : "bg-surface-2 text-acid",
            ].join(" ")}
          >
            {fight.order}
          </span>
          {complete && (
            <span className="label text-[9px] text-muted">
              {tally.total} {tally.total === 1 ? "spėjimas" : "spėjimai"}
            </span>
          )}
        </div>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {facts.map(([term, value]) => (
            <div key={term} className="flex items-baseline gap-1.5">
              <dt className="label text-[8px] text-muted/60">{term}</dt>
              <dd className="text-[11px] font-medium tracking-wide text-muted uppercase">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="flex items-stretch gap-2 sm:gap-3">
        <FighterButton
          fighter={fight.red}
          corner="red"
          fight={fight}
          selected={myPick?.corner === "red"}
          revealed={complete}
          percent={tally.redPercent}
          votes={tally.red}
          disabled={pending}
          onPick={() => pickCorner("red")}
        />
        <div className="label grid flex-none place-items-center text-[10px] text-muted/50">VS</div>
        <FighterButton
          fighter={fight.blue}
          corner="blue"
          fight={fight}
          selected={myPick?.corner === "blue"}
          revealed={complete}
          percent={tally.bluePercent}
          votes={tally.blue}
          disabled={pending}
          onPick={() => pickCorner("blue")}
        />
      </div>

      {myPick && (
        <div className="mt-3 border-t border-line/70 pt-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="label w-full text-[9px] text-muted/70 sm:w-auto">Kaip nugalės?</p>
            <div className="flex min-w-[220px] flex-1 gap-2">
              {(["ko", "points"] as const).map((method) => (
                <StepChip
                  key={method}
                  wide
                  active={myPick.method === method}
                  disabled={pending}
                  label={methodLabel[method]}
                  onClick={() => pickMethod(method)}
                />
              ))}
            </div>
          </div>

          {myPick.method === "ko" && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="label w-full text-[9px] text-muted/70 sm:w-auto">Kuriame raunde?</p>
              <div className="flex flex-wrap gap-2">
                {roundOptions(fight).map((round) => (
                  <StepChip
                    key={round}
                    active={myPick.round === round}
                    disabled={pending}
                    label={`${round}`}
                    onClick={() => pickRound(round)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {complete ? (
        <div className="mt-3.5 border-t border-line/70 pt-3">
          <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-2">
            <span
              className="bg-acid transition-[width] duration-700 ease-out"
              style={{ width: `${tally.redPercent}%` }}
            />
            <span
              className="bg-text/70 transition-[width] duration-700 ease-out"
              style={{ width: `${tally.bluePercent}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-start justify-between gap-4">
            {(["red", "blue"] as const).map((corner) => (
              <div key={corner} className={corner === "blue" ? "text-right" : ""}>
                <p className="label text-[8px] text-muted/60">
                  {tally.crowd[corner].length ? "Spėja" : "Kol kas niekas"}
                </p>
                <div
                  className={[
                    "mt-1 flex flex-wrap gap-1",
                    corner === "blue" ? "justify-end" : "",
                  ].join(" ")}
                >
                  {tally.crowd[corner].slice(0, 12).map((entry, i) => (
                    <span
                      key={`${entry.name}-${i}`}
                      className={`label rounded border px-1.5 py-0.5 text-[9px] ${cornerTone[corner].chip}`}
                    >
                      {entry.name}
                      <span className="ml-1 opacity-60">{entry.summary}</span>
                    </span>
                  ))}
                  {tally.crowd[corner].length > 12 && (
                    <span className="label rounded border border-line px-1.5 py-0.5 text-[9px] text-muted">
                      +{tally.crowd[corner].length - 12}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="label text-[8px] text-muted/60">Pergalės būdas</span>
            <span className="label text-[9px] text-muted">
              Nokautu {tally.ko} · Taškais {tally.points}
              {tally.topRound ? ` · dažniausiai ${tally.topRound} r.` : ""}
            </span>
          </div>

          <p className="label mt-2.5 text-[8px] text-muted/50">
            Spėjimą gali pakeisti bet kada — tiesiog paspausk kitą kovotoją ar būdą.
          </p>
        </div>
      ) : (
        <p className="label mt-3 border-t border-line/70 pt-3 text-[9px] text-muted/70">
          {myPick
            ? myPick.method === "ko"
              ? "Pasirink nokauto raundą, kad pamatytum kitų spėjimus"
              : "Pasirink pergalės būdą, kad pamatytum kitų spėjimus"
            : "Balsuok, kad pamatytum kitų spėjimus"}
        </p>
      )}
    </article>
  );
}
