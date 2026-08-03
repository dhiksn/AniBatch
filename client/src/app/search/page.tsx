"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";

import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    window.history.replaceState(null, '', `/search?q=${encodeURIComponent(q)}${page > 1 ? `&page=${page}` : ''}`);
    fetchApi<any>(`/search?q=${encodeURIComponent(q)}&page=${page}`)
      .then((res) => {
        setData(res.data);
        setPagination(res.pagination);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        console.error(err);
        setData([]);
        setLoading(false);
      });
  }, [q, page]);

  return (
    <main className="w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-8 bg-stone-900/40 p-6 rounded-2xl border border-stone-800/50">
          <MagnifyingGlass weight="bold" className="text-brand-500 text-3xl" />
          <div>
            <h1 className="text-2xl font-black text-stone-100 tracking-tight">
              Pencarian
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              {q ? `Hasil pencarian untuk "${q}"` : "Masukkan kata kunci untuk mencari anime"}
            </p>
          </div>
        </div>

        {!q ? (
          <div className="text-center py-20 text-stone-500 border border-dashed border-stone-800 rounded-2xl">
            Silakan masukkan kata kunci pencarian di atas.
          </div>
        ) : loading ? (
          <CardGridSkeleton count={10} />
        ) : data.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.map((anime: any) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 hover:text-brand-500 transition-colors"
                >
                  <CaretLeft weight="bold" size={16} />
                </button>
                <div className="text-sm font-medium text-stone-400">
                  Halaman <span className="text-stone-100">{pagination.page}</span> dari <span className="text-stone-100">{pagination.totalPages}</span>
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 hover:text-brand-500 transition-colors"
                >
                  <CaretRight weight="bold" size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-stone-500 border border-dashed border-stone-800 rounded-2xl">
            Tidak ada hasil untuk "{q}"
          </div>
        )}
      </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="w-full max-w-5xl mx-auto">
        <div className="h-24 bg-stone-900/40 rounded-2xl animate-pulse border border-stone-800/50 mb-8" />
        <CardGridSkeleton count={10} />
      </main>
    }>
      <SearchContent />
    </Suspense>
  );
}
