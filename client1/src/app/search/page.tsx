import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchContent } from "./SearchContent";
import { CardGridSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = {
  title: "Pencarian — AniBatch",
  description: "Cari anime favorit Anda di AniBatch",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<CardGridSkeleton count={10} />}>
      <SearchContent />
    </Suspense>
  );
}
