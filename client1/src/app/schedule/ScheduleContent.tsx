"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { CalendarBlank } from "@phosphor-icons/react";
import Link from "next/link";
import { AnimeCard } from "@/components/ui/AnimeCard";

export function ScheduleContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activeDay, setActiveDay] = useState("");

  useEffect(() => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
    const todayName = days[new Date().getDay()];
    setToday(todayName);
    setActiveDay(todayName);

    fetchApi<any>("/schedule").then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const activeDayObj = data.find((d: any) => d.day === activeDay);

  return (
    <main className="w-full">
      <div className="flex items-center gap-2 mb-6 bg-stone-900/40 p-6 rounded-2xl border border-stone-800/50">
        <CalendarBlank weight="fill" className="text-brand-500 text-3xl" />
        <div>
          <h1 className="text-2xl font-black text-stone-100 tracking-tight">Jadwal Rilis</h1>
          <p className="text-sm text-stone-400 mt-1">Jadwal update anime terbaru setiap hari</p>
        </div>
      </div>

      {loading ? (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-10 w-24 shrink-0 bg-stone-900/40 border border-stone-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-stone-900/40 border border-stone-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Day tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
            {data.map((dayObj: any) => {
              const isActive = dayObj.day === activeDay;
              const isToday = dayObj.day === today;
              return (
                <button
                  key={dayObj.day}
                  onClick={() => setActiveDay(dayObj.day)}
                  className={`relative shrink-0 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border transition-colors ${
                    isActive
                      ? "bg-brand-500 text-stone-950 border-brand-500"
                      : "bg-stone-900/40 text-stone-400 border-stone-800/50 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  {dayObj.day}
                  {isToday && (
                    <span
                      className={`absolute top-0 -right-0.5 w-2.5 h-2.5 rounded-full ${
                        isActive ? "bg-stone-950" : "bg-yellow-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active day content */}
          <section className="border rounded-2xl overflow-hidden bg-stone-900/40 border-stone-800/50">
            <div className="border-b border-stone-800/50 px-6 py-3 flex items-center justify-between bg-brand-500/10">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-brand-500 uppercase tracking-wider">
                  {activeDayObj?.day}
                </h2>
                {activeDay === today && (
                  <span className="bg-yellow-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                    Hari ini
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-brand-500/60">
                {activeDayObj?.animes.length ?? 0} Anime
              </span>
            </div>

            {activeDayObj && activeDayObj.animes.length > 0 ? (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {activeDayObj.animes.map((anime: any) => (
                  <AnimeCard key={anime.slug} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-sm text-stone-500 italic text-center">
                Libur, tidak ada anime hari ini.
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
