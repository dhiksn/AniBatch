"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListBullets } from "@phosphor-icons/react";
import Link from "next/link";

const LETTERS = ["#","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

export function AnimeListContent() {
  const [groups, setGroups] = useState<{ letter: string; animes: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const letterBarRef = useRef<HTMLDivElement>(null);

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
    const navH = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 64;
    const offset = navH + (letterBarRef.current?.offsetHeight ?? 60) + 8;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
  }

  return (
    <main className="w-full">
      <div className="flex items-center gap-3 mb-6 bg-paper-2 p-4 sm:p-6 rounded-none border border-rule">
        <ListBullets weight="fill" className="text-accent text-3xl shrink-0" />
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl text-ink tracking-tight break-words">Daftar anime</h1>
          <p className="text-sm text-muted mt-1">Semua anime diurutkan berdasarkan abjad A-Z</p>
        </div>
      </div>

      <div
        ref={letterBarRef}
        className="flex flex-nowrap overflow-x-auto hide-scrollbar sm:flex-wrap sm:justify-center gap-1.5 mb-6 sm:mb-8 sticky top-[var(--nav-h)] z-10 bg-paper/95 py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-rule"
      >
        {LETTERS.map((l) => (
          <button
            key={l}
            onClick={() => scrollToLetter(l)}
            className="w-10 h-10 sm:w-9 sm:h-9 shrink-0 rounded-none text-xs font-semibold bg-paper-2 border border-rule text-muted hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-6">
          {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-paper-2 rounded-none animate-pulse border border-rule" />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <div key={group.letter} ref={(el) => { sectionRefs.current[group.letter] = el; }}>
              <div className="font-serif text-xl text-ink mb-3 pb-2 border-b border-rule">{group.letter}</div>
              <div className="columns-1 sm:columns-2 gap-x-10">
                {group.animes.map((anime: any) => (
                  <Link
                    key={anime.slug}
                    href={`/anime/${anime.slug}`}
                    className="flex items-start gap-2 py-2 sm:py-1 text-sm text-ink-2 transition-colors group break-inside-avoid focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded-none"
                  >
                    <span className="text-muted shrink-0 mt-0.5">•</span>
                    <span className="leading-snug group-hover:text-accent transition-colors">{anime.title}</span>
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
