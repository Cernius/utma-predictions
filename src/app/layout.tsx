import type { Metadata } from "next";
import { Fraunces, Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  style: ["italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UTMA #19 · SPĖK KOVŲ NUGALĖTOJUS",
  description:
    "Neoficialus UTMA #19 pagrindinės kortos ir prelims spėjimų žaidimas — pasirink nugalėtojus ir pamatyk, ką spėja kiti.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${oswald.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
