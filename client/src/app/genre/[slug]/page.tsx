"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { ErrorState } from "@/components/ui/ErrorState";
import { Tag, CaretLeft, CaretRight } from "@phosphor-icons/react";

export default function GenreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any[]>([]);
  const [genreInfo, setGenreInfo] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  function load(p: number) {
    if (!slug) return;
    setLoading(true);
    setError(null);
    window.history.replaceState(null, '', p > 1 ? `/genre/${slug}?page=${p}` : `/genre/${slug}`);
    fetchApi<any>(`/genre/${slug}?page=${p}`)
      .then((res) => {
        setData(res.data);
        setGenreInfo(res.genre);
        setPagination(res.pagination);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat data genre");
        setLoading(false);
      });
  }

  useEffect(() => { load(page); }, [slug, page]);

  return (
    <main className="w-full">
      <div className="flex items-center gap-2 mb-8 bg-stone-900/40 p-6 rounded-2xl border border-stone-800/50">
        <Tag weight="fill" className="text-brand-500 text-3xl" />
        <div>
          <h1 className="text-2xl font-black text-stone-100 tracking-tight">
            Genre: <span className="text-brand-500">{genreInfo?.name || slug}</span>
          </h1>
          <p className="text-sm text-stone-400 mt-1">Menampilkan anime dengan genre {genreInfo?.name || slug}</p>
        </div>
      </div>

      {loading ? <CardGridSkeleton count={20} /> : error ? (
        <ErrorState message={error} onRetry={() => load(page)} />
      ) : data.length > 0 ? (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {data.map((anime: any) => <AnimeCard key={anime.slug} anime={anime} />)}
          </div>
          {pagination && pagination.totalPages > 1 && (
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
      ) : (
        <div className="text-center py-20 text-stone-500">Tidak ada anime ditemukan untuk genre ini.</div>
      )}
    </main>
  );
}
