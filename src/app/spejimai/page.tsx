import type { Metadata } from "next";
import { GuessesBoard } from "@/components/GuessesBoard";

export const metadata: Metadata = {
  title: "UTMA #20 · VISI SPĖJIMAI",
};

export default function GuessesPage() {
  return <GuessesBoard />;
}
