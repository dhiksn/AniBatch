"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { proxyImg } from "@/lib/image";
import Link from "next/link";
import {
  Fire,
  PlayCircle,
  CheckCircle,
  FilmStrip,
  CaretLeft,
  CaretRight,
  Star,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";

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

  const spotlightAnime = data?.hot?.[0];
  const trendingReel = data?.hot?.slice(1, 5) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-start">
      <main className="w-full lg:flex-1 min-w-0 flex flex-col gap-12 sm:gap-16">

        {/* Cinematic Spotlight Banner — page 1 only */}
        {currentPage === 1 && (
          <section className="flex flex-col gap-6">
            {loading ? (
              <div className="w-full h-80 sm:h-96 rounded-2xl bg-paper-2 border border-rule animate-pulse" />
            ) : spotlightAnime ? (
              <div className="relative overflow-hidden rounded-2xl border border-rule bg-paper-2">
                {/* Ambient backdrop poster */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={proxyImg(spotlightAnime.thumbnail)}
                    alt={spotlightAnime.title}
                    className="w-full h-full object-cover opacity-20 filter blur-xl scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-paper-2 via-paper-2/85 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-paper-2 via-paper-2/70 to-transparent" />
                </div>

                {/* Spotlight Content */}
                <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                  <Link
                    href={`/anime/${spotlightAnime.slug}`}
                    className="w-36 sm:w-44 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-rule group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus mx-auto md:mx-0"
                  >
                    <img
                      src={proxyImg(spotlightAnime.thumbnail)}
                      alt={spotlightAnime.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col gap-3.5 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-[11px] font-medium">
                        <Sparkle weight="fill" size={11} /> Sorotan Sinema
                      </span>
                      {spotlightAnime.type && (
                        <span className="px-2 py-0.5 rounded-full bg-paper-3 border border-rule text-ink text-[11px] font-medium">
                          {spotlightAnime.type}
                        </span>
                      )}
                      {spotlightAnime.score && (
                        <span className="px-2 py-0.5 rounded-full bg-paper-3 border border-rule text-accent text-[11px] font-medium flex items-center gap-1">
                          <Star weight="fill" size={10} />
                          <span className="num">{spotlightAnime.score}</span>
                        </span>
                      )}
                    </div>

                    <h1 className="font-serif text-2xl sm:text-4xl font-medium text-ink tracking-tight line-clamp-2 leading-tight">
                      {spotlightAnime.title}
                    </h1>

                    <p className="text-sm text-muted line-clamp-2 max-w-xl">
                      {spotlightAnime.episodeLabel
                        ? `Tersedia ${spotlightAnime.episodeLabel} dengan takarir bahasa Indonesia kualitas jernih.`
                        : "Saksikan tayangan anime pilihan minggu ini dengan kualitas audio visual terbaik."}
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                      <Link
                        href={`/anime/${spotlightAnime.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-ink font-medium text-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        Nonton &amp; Unduh Batch
                        <ArrowRight size={14} weight="bold" />
                      </Link>
                      <Link
                        href={`/anime/${spotlightAnime.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-paper-3 border border-rule text-ink-2 font-medium text-sm hover:text-ink hover:border-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        Detail Sinopsis
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Curated Hot Reel */}
            {trendingReel.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fire weight="fill" className="text-accent text-lg" />
                    <h2 className="font-serif text-lg font-medium text-ink">
                      Kurasi Hangat Minggu Ini
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {trendingReel.map((anime: any) => (
                    <AnimeCard key={anime.slug} anime={anime} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Latest Releases Section */}
        <section id="sec-latest" className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <div className="flex items-center gap-2.5">
              <PlayCircle weight="fill" className="text-accent text-2xl" />
              <div>
                <h2 className="font-serif text-2xl font-medium text-ink tracking-tight">
                  Rilisan Terbaru
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Arsip episode anime terbaru subtitle Indonesia
                </p>
              </div>
            </div>
          </div>

          {loading || latestLoading ? (
            <CardGridSkeleton count={10} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {data?.latest?.map((anime: any) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-rule">
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

        {/* Completed Series Section */}
        {data?.completed && data.completed.length > 0 && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <div className="flex items-center gap-2.5">
                <CheckCircle weight="fill" className="text-accent text-2xl" />
                <div>
                  <h2 className="font-serif text-2xl font-medium text-ink tracking-tight">
                    Arsip Seri Tamat
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Paket batch lengkap siap diunduh dan ditonton marathon
                  </p>
                </div>
              </div>
              <Link
                href="/advanced-search?status=completed&order=update"
                className="text-xs font-medium text-muted hover:text-ink px-3 py-1 border border-rule rounded-full hover:bg-paper-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus shrink-0"
              >
                Jelajahi semua
              </Link>
            </div>
            {loading ? (
              <CardGridSkeleton count={5} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {data?.completed?.slice(0, 5).map((anime: any) => (
                  <AnimeCard key={anime.slug} anime={anime} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Movies Section */}
        {data?.movies && data.movies.length > 0 && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <div className="flex items-center gap-2.5">
                <FilmStrip weight="fill" className="text-accent text-2xl" />
                <div>
                  <h2 className="font-serif text-2xl font-medium text-ink tracking-tight">
                    Film Layar Lebar
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Koleksi anime movie berdurasi panjang dengan visual sinematik
                  </p>
                </div>
              </div>
              <Link
                href="/advanced-search?type[]=movie&order=update"
                className="text-xs font-medium text-muted hover:text-ink px-3 py-1 border border-rule rounded-full hover:bg-paper-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus shrink-0"
              >
                Jelajahi semua
              </Link>
            </div>
            {loading ? (
              <CardGridSkeleton count={5} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
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
