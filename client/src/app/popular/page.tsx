"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { ErrorState } from "@/components/ui/ErrorState";
import { Fire, CaretLeft, CaretRight } from "@phosphor-icons/react";

export default function PopularPage() {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(new URLSearchParams(window.location.search).get("page") ?? "1") || 1;
    }
    return 1;
  });

  function load(p: number) {
    setLoading(true);
    setError(null);
    window.history.replaceState(null, "", p > 1 ? `/popular?page=${p}` : "/popular");
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

  return (
    <div className="flex gap-8 items-start">
      <main className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-8 bg-stone-900/40 p-6 rounded-2xl border border-stone-800/50">
          <Fire weight="fill" className="text-brand-500 text-3xl" />
          <div>
            <h1 className="text-2xl font-black text-stone-100 tracking-tight">Anime Populer</h1>
            <p className="text-sm text-stone-400 mt-1">Daftar anime paling populer sepanjang masa</p>
          </div>
        </div>

        {loading ? <CardGridSkeleton count={20} /> : error ? (
          <ErrorState message={error} onRetry={() => load(page)} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.map((anime: any) => <AnimeCard key={anime.slug} anime={anime} />)}
            </div>
            {pagination && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                <button onClick={() => setPage(page - 1)} disabled={!pagination.hasPrev} className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-50 hover:bg-stone-800 hover:text-brand-500 transition-colors">
                  <CaretLeft weight="bold" size={16} />
                </button>
                <div className="text-sm font-medium text-stone-400">
                  Halaman <span className="text-stone-100">{pagination.page}</span> dari <span className="text-stone-100">{pagination.totalPages}</span>
                </div>
                <button onClick={() => setPage(page + 1)} disabled={!pagination.hasNext} className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-50 hover:bg-stone-800 hover:text-brand-500 transition-colors">
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
