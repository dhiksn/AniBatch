"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { motion } from "motion/react";
import Link from "next/link";
import { Fire, PlayCircle, CheckCircle, FilmStrip, CaretLeft, CaretRight } from "@phosphor-icons/react";

export function HomePageContent() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [latestLoading, setLatestLoading] = useState(false);

  // Read page from URL params
  const pageParam = params.page as string;
  const currentPage = parseInt(pageParam || "1", 10) || 1;

  // Fetch data when page changes
  useEffect(() => {
    setLoading(true);
    fetchApi<any>(`/home?page=${currentPage}`)
      .then((res) => {
        setData({ ...res.data, pagination: res.pagination });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [currentPage]);

  // Subsequent latest pages
  async function loadLatestPage(page: number) {
    setLatestLoading(true);
    router.push(page > 1 ? `/page/${page}` : "/");
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
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
      <main className="w-full lg:flex-1 min-w-0 flex flex-col gap-12">

        {/* Hot — only on page 1 */}
        {currentPage === 1 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Fire weight="fill" className="text-accent text-xl" />
              <h2 className="font-serif text-2xl font-medium text-ink">Lagi hangat</h2>
            </div>
            {loading ? (
              <CardGridSkeleton count={5} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {data?.hot?.slice(0, 5).map((anime: any, i: number) => (
                  <motion.div
                    key={anime.slug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
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
              <PlayCircle weight="fill" className="text-accent text-xl" />
              <h2 className="font-serif text-2xl font-medium text-ink">Rilisan terbaru</h2>
            </div>
          </div>

          {loading || latestLoading ? (
            <CardGridSkeleton count={10} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {data?.latest?.map((anime: any) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => loadLatestPage(currentPage - 1)}
                disabled={!data.pagination.hasPrev}
                aria-label="Halaman sebelumnya"
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-paper-2 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-3 hover:border-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <CaretLeft weight="bold" size={16} />
              </button>
              <div className="text-sm font-medium text-muted num">
                Halaman <span className="text-ink font-semibold">{data.pagination.page}</span> dari{" "}
                <span className="text-ink font-semibold">{data.pagination.totalPages}</span>
              </div>
              <button
                onClick={() => loadLatestPage(currentPage + 1)}
                disabled={!data.pagination.hasNext}
                aria-label="Halaman berikutnya"
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-paper-2 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-3 hover:border-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <CaretRight weight="bold" size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Completed */}
        {data?.completed && data.completed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="text-accent text-xl" />
                <h2 className="font-serif text-2xl font-medium text-ink">Selesai tayang</h2>
              </div>
              <Link
                href="/advanced-search?status=completed&order=update"
                className="text-xs font-medium text-muted hover:text-ink px-3 py-1 border border-rule rounded-full hover:bg-paper-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
              >
                Lihat semua
              </Link>
            </div>
            {loading ? (
              <CardGridSkeleton count={5} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {data?.completed?.slice(0, 5).map((anime: any) => (
                  <AnimeCard key={anime.slug} anime={anime} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Movies */}
        {data?.movies && data.movies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FilmStrip weight="fill" className="text-accent text-xl" />
                <h2 className="font-serif text-2xl font-medium text-ink">Film layar lebar</h2>
              </div>
              <Link
                href="/advanced-search?type[]=movie&order=update"
                className="text-xs font-medium text-muted hover:text-ink px-3 py-1 border border-rule rounded-full hover:bg-paper-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
              >
                Lihat semua
              </Link>
            </div>
            {loading ? (
              <CardGridSkeleton count={5} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {data?.movies?.slice(0, 5).map((anime: any) => (
                  <AnimeCard key={anime.slug} anime={anime} />
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      <Sidebar />
    </div>
  );
}
