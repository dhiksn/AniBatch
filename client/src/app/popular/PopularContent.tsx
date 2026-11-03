"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { ErrorState } from "@/components/ui/ErrorState";
import { Fire, CaretLeft, CaretRight } from "@phosphor-icons/react";

export function PopularContent() {
  const params = useParams();
  const router = useRouter();
  const pageParam = params.page as string;
  const page = parseInt(pageParam || "1", 10) || 1;
  
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load(p: number) {
    setLoading(true);
    setError(null);
    fetchApi<any>(`/popular?page=${p}`)
      .then((res) => {
        setData(res.data);
        setPagination(res.pagination);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat data populer");
        setLoading(false);
      });
  }

  useEffect(() => { load(page); }, [page]);

  const handlePageChange = (newPage: number) => {
    router.push(newPage > 1 ? `/popular/page/${newPage}` : "/popular");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
      <main className="w-full lg:flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 bg-paper-2 p-4 sm:p-6 rounded-none border border-rule">
          <Fire weight="fill" className="text-accent text-3xl shrink-0" />
          <div className="min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl text-ink tracking-tight break-words">Anime populer</h1>
            <p className="text-sm text-muted mt-1">Daftar anime paling populer sepanjang masa</p>
          </div>
        </div>

        {loading ? <CardGridSkeleton count={20} /> : error ? (
          <ErrorState message={error} onRetry={() => load(page)} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {data.map((anime: any) => <AnimeCard key={anime.slug} anime={anime} />)}
            </div>
            {pagination && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPrev}
                  aria-label="Halaman sebelumnya"
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-none bg-paper-2 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-none bg-paper-2 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <CaretRight weight="bold" size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Sidebar showSchedule={false} />
    </div>
  );
}
