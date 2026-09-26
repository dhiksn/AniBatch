import type { Metadata } from "next";
import { Suspense } from "react";
import { AdvancedSearchContent } from "./AdvancedSearchContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { CardGridSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = {
  title: "Advanced Search — AniBatch",
  description: "Cari anime dengan filter status, tipe, genre, dan musim di AniBatch",
};

export default function AdvancedSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex gap-8 items-start">
          <main className="flex-1 min-w-0">
            <div className="h-40 bg-stone-900/40 rounded-2xl animate-pulse border border-stone-800/50 mb-8" />
            <CardGridSkeleton count={20} />
          </main>
          <Sidebar />
        </div>
      }
    >
      <AdvancedSearchContent />
    </Suspense>
  );
}
