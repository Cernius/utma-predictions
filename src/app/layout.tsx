import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UTMA #19 · SPĖK KOVŲ NUGALĖTOJUS",
  description:
    "Neoficialus UTMA #19 pagrindinės kortos spėjimų žaidimas — pasirink nugalėtojus ir pamatyk, ką spėja kiti.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={oswald.variable}>
      <body>{children}</body>
    </html>
  );
}
