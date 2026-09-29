import type { Metadata } from "next";
import { PopularContent } from "./PopularContent";

export const metadata: Metadata = {
  title: "Anime Populer — AniBatch",
  description: "Daftar anime paling populer sepanjang masa di AniBatch",
};

export default function PopularPage() {
  return <PopularContent />;
}
