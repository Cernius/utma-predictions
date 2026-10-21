import type { Metadata } from "next";
import { ResultsBoard } from "@/components/ResultsBoard";

export const metadata: Metadata = {
  title: "UTMA #19 · REZULTATAI",
};

export default function ResultsPage() {
  return <ResultsBoard />;
}
