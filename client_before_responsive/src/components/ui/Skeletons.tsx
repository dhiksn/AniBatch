"use client";

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[2/3] w-full bg-stone-900 rounded-xl border border-stone-800/50" />
      <div className="space-y-2">
        <div className="h-4 bg-stone-800 rounded w-full" />
        <div className="h-4 bg-stone-800 rounded w-2/3" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full bg-stone-900/40 border border-stone-800/50 rounded-2xl p-6 sm:p-10 animate-pulse">
      <div className="max-w-2xl space-y-4">
        <div className="h-8 bg-stone-800 rounded w-1/3" />
        <div className="h-12 bg-stone-800 rounded w-3/4" />
        <div className="h-4 bg-stone-800 rounded w-full mt-4" />
        <div className="h-4 bg-stone-800 rounded w-5/6" />
        <div className="h-10 bg-stone-800 rounded w-32 mt-6" />
      </div>
    </div>
  );
}
