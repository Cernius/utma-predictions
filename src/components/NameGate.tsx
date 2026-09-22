"use client";

import { useState } from "react";
import { event } from "@/data/event";
import { asset } from "@/lib/paths";

export function NameGate({
  onSubmit,
  onCancel,
  initialName = "",
}: {
  onSubmit: (name: string) => void;
  /** Present only when the gate is reopened to rename an existing voter. */
  onCancel?: () => void;
  initialName?: string;
}) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-bg px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url(${asset("/brand/utma-19.svg")})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "min(760px, 130%)",
        }}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed) onSubmit(trimmed);
        }}
        className="utma-rise relative w-full max-w-[460px] rounded-2xl border border-line bg-surface p-7 sm:p-9"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/brand/utma-logo.svg")} alt="UTMA" className="h-auto w-[104px]" />

        <p className="label mt-7 text-[10px] text-acid">{event.name} · SPĖJIMŲ ŽAIDIMAS</p>
        <h1 className="mt-2 text-[34px] leading-[0.95] font-semibold uppercase sm:text-[40px]">
          {onCancel ? "Tavo vardas" : "Kas nugalės?"}
        </h1>
        <p className="mt-3 text-[14px] leading-snug font-light text-muted">
          Įvesk savo vardą, atspėk visų kovų nugalėtojus, pergalės būdą ir nokauto raundą —
          tada pamatyk, ką spėja kiti.
        </p>

        <label className="label mt-7 block text-[10px] text-muted" htmlFor="voter-name">
          Tavo vardas
        </label>
        <input
          id="voter-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={28}
          autoFocus
          autoComplete="nickname"
          placeholder="pvz. TITAS"
          className="mt-2 w-full rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-[17px] tracking-wide text-text uppercase placeholder:tracking-normal placeholder:normal-case placeholder:text-muted/50 focus:border-acid focus:outline-none"
        />

        <button
          type="submit"
          disabled={!trimmed}
          className="label mt-5 w-full cursor-pointer rounded-xl bg-acid py-3.5 text-[13px] text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {onCancel ? "Išsaugoti" : "Pradėti spėti"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="label mt-2.5 w-full cursor-pointer rounded-xl border border-line py-3 text-[11px] text-muted transition hover:border-muted/60 hover:text-text"
          >
            Atgal
          </button>
        )}

        <p className="mt-5 text-[11px] leading-relaxed font-light text-muted/70">
          Vardas naudojamas tik tavo spėjimams pažymėti. Neoficialus, fanų sukurtas žaidimas.
        </p>
      </form>
    </div>
  );
}
