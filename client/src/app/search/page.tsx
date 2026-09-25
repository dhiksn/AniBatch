"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q");
  const pageParam = searchParams.get("page");
  const page = parseInt(pageParam || '1', 10) || 1;
  
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    const encodedQuery = q.replace(/\s+/g, '-');
    fetchApi<any>(`/search?q=${encodedQuery}&page=${page}`)
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

  const handlePageChange = (newPage: number) => {
    if (!q) return;
    const encodedQuery = q.replace(/\s+/g, '-');
    router.push(newPage > 1 ? `/search?q=${encodedQuery}&page=${newPage}` : `/search?q=${encodedQuery}`);
  };

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
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 hover:text-brand-500 transition-colors"
                >
                  <CaretLeft weight="bold" size={16} />
                </button>
                <div className="text-sm font-medium text-stone-400">
                  Halaman <span className="text-stone-100">{pagination.page}</span> dari <span className="text-stone-100">{pagination.totalPages}</span>
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
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
