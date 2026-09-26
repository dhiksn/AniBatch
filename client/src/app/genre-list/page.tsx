import type { Metadata } from "next";
import { GenreListContent } from "./GenreListContent";

export const metadata: Metadata = {
  title: "Daftar Genre — AniBatch",
  description: "Jelajahi anime berdasarkan genre favorit Anda di AniBatch",
};

export default function GenreListPage() {
  return <GenreListContent />;
}
