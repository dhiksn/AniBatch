"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { motion, AnimatePresence } from "motion/react";
import { Star, DownloadSimple, FilmStrip, Users, CalendarBlank, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { HeroSkeleton } from "@/components/ui/Skeletons";
import { proxyImg } from "@/lib/image";

export default function AnimeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
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
    <div className="flex gap-8 items-start">
      <main className="flex-1 min-w-0"><HeroSkeleton /></main>
      <Sidebar />
    </div>
  );

  if (error || !data) return (
    <div className="flex gap-8 items-start">
      <main className="flex-1 min-w-0">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 text-sm">
          ⚠️ {error || "Anime tidak ditemukan"}
        </div>
      </main>
      <Sidebar />
    </div>
  );

  const statusStyle =
    data.status?.toLowerCase().includes("completed") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    data.status?.toLowerCase().includes("ongoing")   ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
    "bg-brand-500/10 text-brand-400 border-brand-500/20";

  return (
    <div className="flex gap-8 items-start">
      <main className="flex-1 min-w-0 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-8 bg-stone-900/40 border border-stone-800/50 rounded-2xl p-6 sm:p-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full md:w-56 shrink-0">
            <div className="aspect-[2/3] w-full bg-stone-900 rounded-xl overflow-hidden border border-stone-800 shadow-2xl">
              <img src={proxyImg(data.thumbnail)} alt={data.title} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <div className="flex-1 flex flex-col gap-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-100">{data.title}</h1>
              {data.alternativeTitle && <div className="text-sm font-medium text-stone-500 mt-1">{data.alternativeTitle}</div>}
            </div>

            <div className="flex flex-wrap gap-2">
              {data.status && <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusStyle}`}>{data.status}</div>}
              {data.rating && <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold flex items-center gap-1"><Star weight="fill" size={11} /> {data.rating}</div>}
              {data.type && <div className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-xs font-bold uppercase">{data.type}</div>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-stone-950/50 rounded-xl border border-stone-800/30">
              <MetaItem icon={<FilmStrip />} label="Studio" value={data.studio} />
              <MetaItem icon={<CalendarBlank />} label="Rilis" value={data.released} />
              <MetaItem icon={<Sparkle />} label="Musim" value={data.season}>
                {data.season && (
                  <Link href={`/season/${data.season.toLowerCase().replace(/\s+/g, "-")}`} className="text-xs font-medium text-brand-500 hover:text-brand-400 transition-colors">
                    {data.season}
                  </Link>
                )}
              </MetaItem>
              {data.cast?.length > 0 && (
                <div className="col-span-2 sm:col-span-3 flex flex-col gap-1">
                  <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1"><Users size={11} /> Cast</div>
                  <div className="text-xs text-stone-300 leading-relaxed flex flex-wrap gap-x-1">
                    {data.cast.map((c: any, i: number) => (
                      <span key={c.slug}>
                        <Link href={`/cast/${c.slug}`} className="hover:text-brand-500 transition-colors">{c.name}</Link>
                        {i < data.cast.length - 1 && <span className="text-stone-600">, </span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {data.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.genres.map((g: any) => (
                  <Link key={g.slug} href={`/genre/${g.slug}`} className="text-xs font-medium text-stone-300 bg-stone-800/50 hover:bg-brand-500 hover:text-stone-50 hover:border-brand-500 px-3 py-1.5 rounded-full border border-stone-700 transition-colors">
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
  if (!isLong) return <p className="text-sm text-stone-400 leading-relaxed mt-1">{description}</p>;
  return (
    <div className="mt-1 flex flex-col items-start w-full">
      <motion.div initial={false} animate={{ height: isExpanded ? "auto" : "4.5rem" }} transition={{ duration: 0.3 }} className="relative overflow-hidden w-full">
        <div className="text-sm text-stone-400 leading-relaxed pb-1">{description}</div>
        <AnimatePresence>
          {!isExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-stone-900/60 to-transparent pointer-events-none" />
          )}
        </AnimatePresence>
      </motion.div>
      <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-bold text-brand-500 hover:text-brand-400 mt-2 transition-colors bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-full hover:bg-stone-800">
        {isExpanded ? "Tutup ringkasan" : "Baca selengkapnya..."}
      </button>
    </div>
  );
}

function DownloadSection({ downloads }: { downloads: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!downloads?.length) return null;
  return (
    <section className="bg-stone-900/40 border border-stone-800/50 rounded-2xl overflow-hidden mt-2">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-stone-800/60 bg-stone-950/20">
        <DownloadSimple weight="fill" className="text-brand-500 text-xl" />
        <h2 className="text-base font-bold text-stone-100 tracking-tight">Download Links</h2>
      </div>
      <div className="flex flex-col divide-y divide-stone-800/60">
        {downloads.map((dl: any, i: number) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`transition-colors duration-300 ${isOpen ? "bg-stone-950/40" : ""}`}>
              <button onClick={() => setOpenIndex(isOpen ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left group">
                <span className={`text-sm font-bold transition-colors ${isOpen ? "text-brand-500" : "text-stone-300 group-hover:text-stone-100"}`}>{dl.episode}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-brand-500/10 text-brand-500 rotate-45" : "bg-stone-800/50 text-stone-400 group-hover:bg-stone-700"}`}>
                  <span className="text-lg font-light leading-none mb-0.5">+</span>
                </div>
              </button>
              <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="px-6 pb-5 pt-1 flex flex-col gap-3">
                  {dl.qualities?.map((q: any, j: number) => (
                    <div key={j} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-2 px-4 rounded-xl bg-stone-900/50 border border-stone-800/50">
                      <div className="flex items-center gap-2 sm:w-20 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        <span className="text-xs font-bold text-stone-300">{q.resolution}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {q.mirrors?.map((m: any, k: number) => (
                          <a key={k} href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium bg-stone-800/80 hover:bg-brand-500 text-stone-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-stone-700/50 hover:border-brand-500 transition-all duration-200">
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
    <div className="flex flex-col gap-1">
      <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1">{icon} {label}</div>
      {children ?? <div className="text-xs font-medium text-stone-200">{value}</div>}
    </div>
  );
}
