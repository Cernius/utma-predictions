"use client";

import type { Ballot } from "@/lib/ballots";
import { isPickComplete } from "@/lib/ballots";
import { fights } from "@/data/event";

/** Everyone who has voted, most complete cards first — the social proof panel. */
export function Leaderboard({ ballots, myId }: { ballots: Ballot[]; myId: string }) {
  const rows = [...ballots]
    .map((ballot) => ({
      ...ballot,
      count: Object.values(ballot.picks).filter(isPickComplete).length,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.updatedAt - b.updatedAt);

  return (
    <section id="spejejai" className="scroll-mt-24">
      <header className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="label text-[10px] text-acid">Bendruomenė</p>
          <h2 className="text-[24px] leading-none font-semibold uppercase sm:text-[28px]">
            Kiti spėjėjai
          </h2>
        </div>
        <span className="label text-[10px] whitespace-nowrap text-muted">
          {rows.length} {rows.length === 1 ? "žaidėjas" : "žaidėjai"}
        </span>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-5 text-[13px] font-light text-muted">
          Kol kas spėjimų nėra. Būk pirmas ir pasidalink nuoroda su draugais.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {rows.map((row, i) => {
            const isMe = row.voterId === myId;
            return (
              <li
                key={row.voterId}
                className={[
                  "flex items-center gap-3 rounded-xl border px-3.5 py-3",
                  isMe ? "border-acid/45 bg-surface-2" : "border-line bg-surface",
                ].join(" ")}
              >
                <span className="label w-6 flex-none text-[10px] text-muted/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium uppercase">
                  {row.name}
                  {isMe && <span className="label ml-2 text-[9px] text-acid">Tu</span>}
                </span>
                <span className="label flex-none text-[10px] text-muted">
                  {row.count}/{fights.length}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
