import { Suspense } from "react";
import { SearchContent } from "./SearchContent";
import { CardGridSkeleton } from "@/components/ui/Skeletons";

export default function SearchPage() {
  return (
    <Suspense fallback={<CardGridSkeleton count={10} />}>
      <SearchContent />
    </Suspense>
  );
}
