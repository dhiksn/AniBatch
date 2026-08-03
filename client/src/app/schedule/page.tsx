"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { CalendarBlank } from "@phosphor-icons/react";
import Link from "next/link";

export default function SchedulePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");

  useEffect(() => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
    setToday(days[new Date().getDay()]);

    fetchApi<any>("/schedule").then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <main className="w-full">
        <div className="flex items-center gap-2 mb-8 bg-stone-900/40 p-6 rounded-2xl border border-stone-800/50">
          <CalendarBlank weight="fill" className="text-brand-500 text-3xl" />
          <div>
            <h1 className="text-2xl font-black text-stone-100 tracking-tight">Jadwal Rilis</h1>
            <p className="text-sm text-stone-400 mt-1">Jadwal update anime terbaru setiap hari</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-40 bg-stone-900/40 border border-stone-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {data.map((dayObj: any) => {
              const isToday = dayObj.day === today;
              return (
              <section key={dayObj.day} className={`border rounded-2xl overflow-hidden transition-colors ${isToday ? "bg-brand-500/5 border-brand-500/40" : "bg-stone-900/40 border-stone-800/50"}`}>
                <div className={`border-b px-6 py-3 flex items-center justify-between ${isToday ? "bg-brand-500/20 border-brand-500/30" : "bg-brand-500/10 border-brand-500/20"}`}>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-brand-500 uppercase tracking-wider">{dayObj.day}</h2>
                    {isToday && (
                      <span className="bg-yellow-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                        Hari ini
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-brand-500/60">{dayObj.animes.length} Anime</span>
                </div>
                
                {dayObj.animes.length > 0 ? (
                  <div className="p-4 relative group/row">
                    <button
                      onClick={() => {
                        const el = document.getElementById(`scroll-${dayObj.day}`);
                        if (el) el.scrollBy({ left: -400, behavior: 'smooth' });
                      }}
                      onMouseEnter={(e) => {
                        const el = document.getElementById(`scroll-${dayObj.day}`);
                        if (el && el.scrollWidth <= el.clientWidth) (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-stone-900/90 border border-stone-700 rounded-full text-stone-300 hover:text-brand-500 hover:border-brand-500 transition-colors opacity-0 group-hover/row:opacity-100"
                      ref={(btn) => {
                        if (!btn) return;
                        const el = document.getElementById(`scroll-${dayObj.day}`);
                        if (el && el.scrollWidth <= el.clientWidth) btn.style.display = 'none';
                      }}
                    >
                      ‹
                    </button>
                    <div
                      id={`scroll-${dayObj.day}`}
                      className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar scroll-smooth"
                      onScroll={(e) => {
                        const el = e.currentTarget;
                        const parent = el.closest('.group\\/row');
                        if (!parent) return;
                        const btns = parent.querySelectorAll('button');
                        if (btns[0]) btns[0].style.display = el.scrollLeft <= 0 ? 'none' : '';
                        if (btns[1]) btns[1].style.display = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 ? 'none' : '';
                      }}
                    >
                      {dayObj.animes.map((anime: any) => (
                        <Link
                          key={anime.slug}
                          href={`/anime/${anime.slug}`}
                          className="flex flex-col gap-2 w-[120px] shrink-0 snap-start group"
                        >
                          <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-800">
                            <img
                              src={anime.thumbnail || '/img/no-image.svg'}
                              alt={anime.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-stone-200 line-clamp-2 group-hover:text-brand-500 transition-colors">{anime.title}</h3>
                            <p className="text-[10px] text-stone-500 mt-0.5">{anime.episodeLabel || anime.type}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const el = document.getElementById(`scroll-${dayObj.day}`);
                        if (el) el.scrollBy({ left: 400, behavior: 'smooth' });
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-stone-900/90 border border-stone-700 rounded-full text-stone-300 hover:text-brand-500 hover:border-brand-500 transition-colors opacity-0 group-hover/row:opacity-100"
                      ref={(btn) => {
                        if (!btn) return;
                        const el = document.getElementById(`scroll-${dayObj.day}`);
                        if (el && el.scrollWidth <= el.clientWidth) btn.style.display = 'none';
                      }}
                    >
                      ›
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-sm text-stone-500 italic text-center">Libur, tidak ada anime hari ini.</div>
                )}
              </section>
              );
            })}
          </div>
        )}
      </main>
  );
}
