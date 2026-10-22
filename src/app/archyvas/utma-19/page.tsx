import type { Metadata } from "next";
import { ResultsBoard } from "@/components/ResultsBoard";
import {
  archivedCardSections,
  archivedEvent,
  archivedFights,
  archivedResults,
} from "@/data/archive/utma-19";

export const metadata: Metadata = {
  title: "UTMA #19 · ARCHYVAS",
  description: "Kaip baigėsi UTMA #19 spėjimų žaidimas — galutinė lentelė ir kovų rezultatai.",
};

export default function Utma19ArchivePage() {
  return (
    <ResultsBoard
      event={archivedEvent}
      cardSections={archivedCardSections}
      fights={archivedFights}
      results={archivedResults}
      archived
    />
  );
}
