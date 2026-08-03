"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListBullets } from "@phosphor-icons/react";
import Link from "next/link";

const LETTERS = ["#","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

export default function AnimeListPage() {
  const [groups, setGroups] = useState<{ letter: string; animes: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function load() {
    setLoading(true);
    setError(null);
    fetchApi<any>("/list")
      .then((res) => {
        const merged: Record<string, any[]> = {};
        for (const group of (res.data ?? [])) {
          const key = group.letter.toUpperCase();
          if (!merged[key]) merged[key] = [];
          merged[key].push(...(group.animes ?? []));
        }
        setGroups(Object.entries(merged).map(([letter, animes]) => ({ letter, animes })));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat daftar anime");
        setLoading(false);
      });
  }

  useEffect(() => { load(); }, []);

  function scrollToLetter(letter: string) {
    const el = sectionRefs.current[letter];
    if (!el) return;
    const offset = 64 + 60 + 16;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
  }

  return (
    <main className="w-full">
      <div className="flex items-center gap-2 mb-6 bg-stone-900/40 p-6 rounded-2xl border border-stone-800/50">
        <ListBullets weight="fill" className="text-brand-500 text-3xl" />
        <div>
          <h1 className="text-2xl font-black text-stone-100 tracking-tight">Daftar Anime</h1>
          <p className="text-sm text-stone-400 mt-1">Semua anime diurutkan berdasarkan huruf</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mb-8 sticky top-16 z-10 bg-stone-950/90 backdrop-blur py-3">
        {LETTERS.map((l) => (
          <button key={l} onClick={() => scrollToLetter(l)} className="w-9 h-9 rounded-lg text-sm font-bold bg-stone-900 border border-stone-800 text-stone-400 hover:border-brand-500 hover:text-brand-500 transition-colors">
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-6">
          {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-stone-900/40 rounded-2xl animate-pulse border border-stone-800/50" />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <div key={group.letter} ref={(el) => { sectionRefs.current[group.letter] = el; }}>
              <div className="text-base font-black text-stone-300 mb-3 pb-2 border-b border-stone-700">{group.letter}</div>
              <div className="columns-2 gap-x-10">
                {group.animes.map((anime: any) => (
                  <Link key={anime.slug} href={`/anime/${anime.slug}`} className="flex items-start gap-2 py-1 text-sm text-stone-400 transition-colors group break-inside-avoid">
                    <span className="text-stone-600 shrink-0 mt-0.5">•</span>
                    <span className="leading-snug group-hover:text-brand-500 transition-colors">{anime.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
