"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { ErrorState } from "@/components/ui/ErrorState";
import { CalendarBlank } from "@phosphor-icons/react";

export default function SeasonPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any[]>([]);
  const [seasonName, setSeasonName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchApi<any>(`/season/${slug}`)
      .then((res) => {
        setData(res.data || []);
        setSeasonName(res.season?.name || res.season || slug);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat data musim");
        setLoading(false);
      });
  }

  useEffect(() => { load(); }, [slug]);

  return (
    <main className="w-full">
      <div className="flex items-center gap-2 mb-8 bg-stone-900/40 p-6 rounded-2xl border border-stone-800/50">
        <CalendarBlank weight="fill" className="text-brand-500 text-3xl" />
        <div>
          <h1 className="text-2xl font-black text-stone-100 tracking-tight">
            Musim: <span className="text-brand-500">{seasonName || slug}</span>
          </h1>
          <p className="text-sm text-stone-400 mt-1">Daftar anime yang rilis pada musim {seasonName || slug}</p>
        </div>
      </div>

      {loading ? <CardGridSkeleton count={20} /> : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : data.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data.map((anime: any) => <AnimeCard key={anime.slug} anime={anime} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-stone-500">Tidak ada anime ditemukan untuk musim ini.</div>
      )}
    </main>
  );
}
