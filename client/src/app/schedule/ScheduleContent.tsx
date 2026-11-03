"use client";

import { useEffect, useRef, useState } from "react";
import { fetchApi } from "@/lib/api";
import { CalendarBlank } from "@phosphor-icons/react";
import { AnimeCard } from "@/components/ui/AnimeCard";

export function ScheduleContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activeDay, setActiveDay] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);

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

  // Pastikan tab hari aktif terlihat di layar sempit
  useEffect(() => {
    const el = tabsRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [activeDay, data]);

  const activeDayObj = data.find((d: any) => d.day === activeDay);

  return (
    <main className="w-full">
      <div className="flex items-center gap-3 mb-6 bg-paper-2 p-4 sm:p-6 rounded-xl border border-rule">
        <CalendarBlank weight="fill" className="text-accent text-3xl shrink-0" />
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink tracking-tight break-words">Jadwal rilis</h1>
          <p className="text-sm text-muted mt-1">Jadwal update anime terbaru setiap hari</p>
        </div>
      </div>

      {loading ? (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-10 w-24 shrink-0 bg-paper-2 border border-rule rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-paper-2 border border-rule rounded-xl animate-pulse" />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Day tabs */}
          <div ref={tabsRef} className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {data.map((dayObj: any) => {
              const isActive = dayObj.day === activeDay;
              const isToday = dayObj.day === today;
              return (
                <button
                  key={dayObj.day}
                  data-active={isActive}
                  onClick={() => setActiveDay(dayObj.day)}
                  className={`relative shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus ${
                    isActive
                      ? "bg-accent text-accent-ink border-accent"
                      : "bg-paper-2 text-muted border-rule hover:text-ink hover:border-muted"
                  }`}
                >
                  {dayObj.day}
                  {isToday && (
                    <span
                      className={`absolute top-0.5 right-1 w-2 h-2 rounded-full ${
                        isActive ? "bg-accent-ink" : "bg-accent"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active day content */}
          <section className="border rounded-xl overflow-hidden bg-paper-2 border-rule">
            <div className="border-b border-rule px-4 sm:px-6 py-3.5 flex items-center justify-between bg-paper">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-medium text-ink">
                  {activeDayObj?.day}
                </h2>
                {activeDay === today && (
                  <span className="bg-accent text-accent-ink text-[11px] font-medium px-2 py-0.5 rounded-full">
                    Hari ini
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-muted num">
                {activeDayObj?.animes.length ?? 0} anime
              </span>
            </div>

            {activeDayObj && activeDayObj.animes.length > 0 ? (
              <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {activeDayObj.animes.map((anime: any) => (
                  <AnimeCard key={anime.slug} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-sm text-muted italic text-center">
                Libur, tidak ada anime hari ini.
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
