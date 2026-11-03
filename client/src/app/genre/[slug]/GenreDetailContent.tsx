"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { ErrorState } from "@/components/ui/ErrorState";
import { Tag, CaretLeft, CaretRight } from "@phosphor-icons/react";

export function GenreDetailContent({ slug: providedSlug }: { slug?: string }) {
  const params = useParams();
  const router = useRouter();
  const slug = providedSlug || (params.slug as string);
  const pageParam = params.page as string;
  const page = parseInt(pageParam || "1", 10) || 1;
  
  const [data, setData] = useState<any[]>([]);
  const [genreInfo, setGenreInfo] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load(p: number) {
    if (!slug) return;
    setLoading(true);
    setError(null);
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

  const handlePageChange = (newPage: number) => {
    router.push(newPage > 1 ? `/genre/${slug}/page/${newPage}` : `/genre/${slug}`);
  };

  return (
    <main className="w-full">
      <div className="flex items-center gap-3 mb-6 sm:mb-8 bg-paper-2 p-4 sm:p-6 rounded-xl border border-rule">
        <Tag weight="fill" className="text-accent text-3xl shrink-0" />
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink tracking-tight break-words">
            Genre: <span className="text-accent">{genreInfo?.name || slug}</span>
          </h1>
          <p className="text-sm text-muted mt-1">Menampilkan anime dengan genre {genreInfo?.name || slug}</p>
        </div>
      </div>

      {loading ? <CardGridSkeleton count={20} /> : error ? (
        <ErrorState message={error} onRetry={() => load(page)} />
      ) : data.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.map((anime: any) => <AnimeCard key={anime.slug} anime={anime} />)}
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
          Tidak ada anime ditemukan untuk genre ini.
        </div>
      )}
    </main>
  );
}
