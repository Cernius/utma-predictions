import type { Metadata } from "next";
import { ResultsBoard } from "@/components/ResultsBoard";
import { cardSections, event, fights } from "@/data/event";
import { results } from "@/data/results";

export const metadata: Metadata = {
  title: "UTMA #20 · REZULTATAI",
};

export default function ResultsPage() {
  return (
    <ResultsBoard
      event={event}
      cardSections={cardSections}
      fights={fights}
      results={results}
    />
  );
}
