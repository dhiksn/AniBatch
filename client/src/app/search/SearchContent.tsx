"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react";

export function SearchContent({ query }: { query?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = query || searchParams.get("q");
  const pageParam = searchParams.get("page");
  const page = parseInt(pageParam || "1", 10) || 1;
  
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetchApi<any>(`/search?q=${encodeURIComponent(q)}&page=${page}`)
      .then((res) => {
        setData(res.data);
        setPagination(res.pagination);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        console.error(err);
        setData([]);
        setLoading(false);
      });
  }, [q, page]);

  const handlePageChange = (newPage: number) => {
    if (!q) return;
    router.push(newPage > 1 ? `/search?q=${encodeURIComponent(q)}&page=${newPage}` : `/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <main className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6 sm:mb-8 bg-paper-2 p-4 sm:p-6 rounded-xl border border-rule">
        <MagnifyingGlass weight="bold" className="text-accent text-3xl shrink-0" />
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink tracking-tight break-words">
            Pencarian
          </h1>
          <p className="text-sm text-muted mt-1">
            {q ? `Hasil pencarian untuk "${q}"` : "Masukkan kata kunci untuk mencari anime"}
          </p>
        </div>
      </div>

      {!q ? (
        <div className="text-center py-20 text-muted border border-dashed border-rule rounded-xl">
          Silakan masukkan kata kunci pencarian pada kolom pencarian di atas.
        </div>
      ) : loading ? (
        <CardGridSkeleton count={10} />
      ) : data.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {data.map((anime: any) => (
              <AnimeCard key={anime.slug} anime={anime} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 mb-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrev}
                aria-label="Halaman sebelumnya"
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-paper-2 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <CaretLeft weight="bold" size={16} />
              </button>
              <div className="text-sm font-medium text-muted num">
                Halaman <span className="text-ink font-semibold">{pagination.page}</span> dari{" "}
                <span className="text-ink font-semibold">{pagination.totalPages}</span>
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNext}
                aria-label="Halaman berikutnya"
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-paper-2 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <CaretRight weight="bold" size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-muted border border-dashed border-rule rounded-xl">
          Tidak ditemukan hasil untuk &ldquo;{q}&rdquo;. Coba kata kunci yang lain.
        </div>
      )}
    </main>
  );
}
