import { Suspense } from "react";
import { HomePageContent } from "./HomePageContent";

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageLoading() {
  return (
    <div className="flex gap-8 items-start">
      <main className="flex-1 min-w-0 flex flex-col gap-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-stone-800 rounded animate-pulse" />
          <div className="w-48 h-6 bg-stone-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-stone-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </main>
      <div className="w-80 hidden lg:block">
        <div className="w-full h-96 bg-stone-900 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
