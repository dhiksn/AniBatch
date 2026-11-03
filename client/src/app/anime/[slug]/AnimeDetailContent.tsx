"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { motion, AnimatePresence } from "motion/react";
import { Star, DownloadSimple, FilmStrip, Users, CalendarBlank, Sparkle, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { HeroSkeleton } from "@/components/ui/Skeletons";
import { proxyImg } from "@/lib/image";

export function AnimeDetailContent({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchApi<any>(`/anime/${slug}`)
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((err) => { setError(err.message || "Gagal memuat data anime"); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
      <main className="w-full lg:flex-1 min-w-0"><HeroSkeleton /></main>
      <Sidebar />
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
      <main className="w-full lg:flex-1 min-w-0">
        <div className="bg-paper-2 border border-error/30 text-error rounded-xl p-6 text-sm flex items-center gap-3">
          <WarningCircle size={20} className="shrink-0" />
          <span>{error || "Anime tidak ditemukan"}</span>
        </div>
      </main>
      <Sidebar />
    </div>
  );

  const statusStyle =
    data.status?.toLowerCase().includes("completed") ? "bg-paper-3 text-ink-2 border-rule" :
    data.status?.toLowerCase().includes("ongoing")   ? "bg-accent/15 text-accent border-accent/30" :
    "bg-paper-3 text-ink-2 border-rule";

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
      <main className="w-full lg:flex-1 min-w-0 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 bg-paper-2 border border-rule rounded-xl p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} className="w-40 sm:w-48 md:w-56 mx-auto md:mx-0 shrink-0">
            <div className="aspect-[2/3] w-full bg-paper-3 rounded-xl overflow-hidden border border-rule shadow-md">
              <img src={proxyImg(data.thumbnail)} alt={data.title} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0 flex flex-col gap-5">
            <div>
              <h1 className="font-serif text-2xl sm:text-4xl font-medium tracking-tight text-ink break-words text-center md:text-left">
                {data.title}
              </h1>
              {data.alternativeTitle && (
                <div className="text-sm font-normal text-muted mt-1 break-words text-center md:text-left">
                  {data.alternativeTitle}
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {data.status && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyle}`}>
                  {data.status}
                </div>
              )}
              {data.rating && (
                <div className="px-3 py-1 rounded-full bg-paper-3 text-accent border border-rule text-xs font-medium flex items-center gap-1">
                  <Star weight="fill" size={12} />
                  <span className="num">{data.rating}</span>
                </div>
              )}
              {data.type && (
                <div className="px-3 py-1 rounded-full bg-paper-3 text-ink border border-rule text-xs font-medium">
                  {data.type}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 sm:gap-4 p-3 sm:p-4 bg-paper rounded-lg border border-rule">
              <MetaItem icon={<FilmStrip />} label="Studio" value={data.studio} />
              <MetaItem icon={<CalendarBlank />} label="Rilis" value={data.released} />
              <MetaItem icon={<Sparkle />} label="Musim" value={data.season}>
                {data.season && (
                  <Link href={`/season/${data.season.toLowerCase().replace(/\s+/g, "-")}`} className="text-xs font-medium text-accent hover:underline transition-colors">
                    {data.season}
                  </Link>
                )}
              </MetaItem>
              {data.cast?.length > 0 && (
                <div className="col-span-2 sm:col-span-3 flex flex-col gap-1">
                  <div className="text-xs font-medium text-muted flex items-center gap-1.5">
                    <Users size={13} />
                    <span>Pemeran</span>
                  </div>
                  <div className="text-xs text-ink leading-relaxed flex flex-wrap gap-x-1">
                    {data.cast.map((c: any, i: number) => (
                      <span key={c.slug}>
                        <Link href={`/cast/${c.slug}`} className="hover:text-accent transition-colors">{c.name}</Link>
                        {i < data.cast.length - 1 && <span className="text-muted">, </span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {data.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.genres.map((g: any) => (
                  <Link
                    key={g.slug}
                    href={`/genre/${g.slug}`}
                    className="text-xs font-medium text-muted bg-paper-3 hover:text-ink hover:border-muted px-3 py-1.5 rounded-full border border-rule transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {data.description && <SynopsisSection description={data.description} />}
          </div>
        </div>

        <DownloadSection downloads={data.downloads} />
      </main>
      <Sidebar />
    </div>
  );
}

function SynopsisSection({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = description.length > 250;
  if (!isLong) return <p className="text-sm text-ink-2 leading-relaxed mt-1">{description}</p>;
  return (
    <div className="mt-1 flex flex-col items-start w-full">
      <motion.div initial={false} animate={{ height: isExpanded ? "auto" : "4.5rem" }} transition={{ duration: 0.25 }} className="relative overflow-hidden w-full">
        <div className="text-sm text-ink-2 leading-relaxed pb-1">{description}</div>
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-paper-2 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs font-medium text-accent hover:underline mt-2 transition-colors bg-paper-3 border border-rule px-3.5 py-1.5 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
      >
        {isExpanded ? "Tutup ringkasan" : "Baca selengkapnya…"}
      </button>
    </div>
  );
}

function DownloadSection({ downloads }: { downloads: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!downloads?.length) return null;
  return (
    <section className="bg-paper-2 border border-rule rounded-xl overflow-hidden mt-2">
      <div className="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-rule bg-paper">
        <DownloadSimple weight="fill" className="text-accent text-xl" />
        <h2 className="font-serif text-lg font-medium text-ink">Tautan unduh batch & episode</h2>
      </div>
      <div className="flex flex-col divide-y divide-rule">
        {downloads.map((dl: any, i: number) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`transition-colors duration-200 ${isOpen ? "bg-paper/50" : ""}`}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 text-left group min-h-14 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
              >
                <span className={`text-sm font-medium break-words min-w-0 transition-colors ${isOpen ? "text-accent" : "text-ink group-hover:text-ink-2"}`}>
                  {dl.episode}
                </span>
                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center transition-[transform,background-color,color] duration-200 ${isOpen ? "bg-accent/15 text-accent rotate-45" : "bg-paper-3 text-muted group-hover:text-ink"}`}>
                  <span className="text-base font-normal leading-none">+</span>
                </div>
              </button>
              <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="px-3 sm:px-6 pb-5 pt-1 flex flex-col gap-3">
                  {dl.qualities?.map((q: any, j: number) => (
                    <div key={j} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-3 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-paper border border-rule">
                      <div className="flex items-center gap-2 sm:w-20 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-xs font-semibold text-ink num">{q.resolution}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {q.mirrors?.map((m: any, k: number) => (
                          <a
                            key={k}
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium bg-paper-3 hover:bg-accent hover:text-accent-ink text-ink-2 px-3.5 py-1.5 rounded-md border border-rule transition-[background-color,color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
                          >
                            {m.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MetaItem({ icon, label, value, children }: { icon: React.ReactNode; label: string; value?: string; children?: React.ReactNode }) {
  if (!value && !children) return null;
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="text-xs font-medium text-muted flex items-center gap-1.5">{icon} {label}</div>
      {children ?? <div className="text-xs font-medium text-ink break-words">{value}</div>}
    </div>
  );
}
