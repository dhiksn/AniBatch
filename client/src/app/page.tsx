"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { motion } from "motion/react";
import Link from "next/link";
import { Fire, PlayCircle, CheckCircle, FilmStrip, CaretLeft, CaretRight } from "@phosphor-icons/react";

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [latestPage, setLatestPage] = useState(1);
  const [latestLoading, setLatestLoading] = useState(false);

  // Read initial page from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get("page") ?? "1") || 1;
    setLatestPage(p);
    fetchApi<any>(`/home?page=${p}`)
      .then((res) => {
        setData({ ...res.data, pagination: res.pagination });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Subsequent latest pages
  async function loadLatestPage(page: number) {
    setLatestPage(page);
    setLatestLoading(true);
    window.history.pushState(null, '', page > 1 ? `/?page=${page}` : '/');
    try {
      const res = await fetchApi<any>(`/home?page=${page}`);
      setData((prev: any) => ({
        ...prev,
        latest: res.data.latest,
        pagination: res.pagination,
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
    } finally {
      setLatestLoading(false);
    }
  }

  return (
    <div className="flex gap-8 items-start">
      <main className="flex-1 min-w-0 flex flex-col gap-12">

        {/* Hot — only on page 1 */}
        {latestPage === 1 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Fire weight="fill" className="text-brand-500 text-2xl" />
            <h2 className="text-xl font-bold text-stone-100 tracking-tight">Lagi Hangat</h2>
          </div>
          {loading ? (
            <CardGridSkeleton count={5} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {data?.hot?.slice(0, 5).map((anime: any, i: number) => (
                <motion.div
                  key={anime.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <AnimeCard anime={anime} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
        )}

        {/* Latest */}
        <section id="sec-latest">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PlayCircle weight="fill" className="text-brand-500 text-2xl" />
              <h2 className="text-xl font-bold text-stone-100 tracking-tight">Rilisan Terbaru</h2>
            </div>
          </div>

          {loading || latestLoading ? (
            <CardGridSkeleton count={12} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data?.latest?.map((anime: any) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => loadLatestPage(latestPage - 1)}
                disabled={!data.pagination.hasPrev}
                className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 hover:text-brand-500 transition-colors"
              >
                <CaretLeft weight="bold" size={16} />
              </button>
              <div className="text-sm font-medium text-stone-400">
                Halaman <span className="text-stone-100">{data.pagination.page}</span> dari{" "}
                <span className="text-stone-100">{data.pagination.totalPages}</span>
              </div>
              <button
                onClick={() => loadLatestPage(latestPage + 1)}
                disabled={!data.pagination.hasNext}
                className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 hover:text-brand-500 transition-colors"
              >
                <CaretRight weight="bold" size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Completed */}
        <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="text-brand-500 text-2xl" />
                <h2 className="text-xl font-bold text-stone-100 tracking-tight">Selesai Tayang</h2>
              </div>
              <Link
                href="/advanced-search?status=completed&order=update"
                className="text-xs font-medium text-brand-500 hover:text-brand-400 px-3 py-1.5 border border-brand-500/30 rounded-full hover:bg-brand-500/10 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>
            {loading ? (
              <CardGridSkeleton count={5} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {data?.completed?.slice(0, 5).map((anime: any) => (
                  <AnimeCard key={anime.slug} anime={anime} />
                ))}
              </div>
            )}
          </section>

        {/* Movies */}
        <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FilmStrip weight="fill" className="text-brand-500 text-2xl" />
                <h2 className="text-xl font-bold text-stone-100 tracking-tight">Film Layar Lebar</h2>
              </div>
              <Link
                href="/advanced-search?type[]=movie&order=update"
                className="text-xs font-medium text-brand-500 hover:text-brand-400 px-3 py-1.5 border border-brand-500/30 rounded-full hover:bg-brand-500/10 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>
            {loading ? (
              <CardGridSkeleton count={5} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {data?.movies?.slice(0, 5).map((anime: any) => (
                  <AnimeCard key={anime.slug} anime={anime} />
                ))}
              </div>
            )}
          </section>

      </main>

      <Sidebar />
    </div>
  );
}
