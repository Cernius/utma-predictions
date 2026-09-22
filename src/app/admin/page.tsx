import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "UTMA #19 · Admin",
  // Unlinked from the site, and kept out of search results.
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
