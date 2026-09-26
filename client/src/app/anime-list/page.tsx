import type { Metadata } from "next";
import { AnimeListContent } from "./AnimeListContent";

export const metadata: Metadata = {
  title: "Daftar Anime — AniBatch",
  description: "Daftar lengkap semua anime di AniBatch diurutkan berdasarkan huruf",
};

export default function AnimeListPage() {
  return <AnimeListContent />;
}
