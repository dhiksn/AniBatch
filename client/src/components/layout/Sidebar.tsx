"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { proxyImg } from "@/lib/image";
import { Fire, CalendarBlank, Clock } from "@phosphor-icons/react";

export function Sidebar({ showSchedule = true }: { showSchedule?: boolean }) {
  return (
    <aside className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-6 mt-4 lg:mt-0">
      <PopularWidget />
      {showSchedule && <TodayScheduleWidget />}
      <SeasonsWidget />
    </aside>
  );
}

function PopularWidget() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<"weekly" | "monthly" | "alltime">("weekly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any>("/popular-sidebar").then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const tabLabels: Record<"weekly" | "monthly" | "alltime", string> = {
    weekly: "Mingguan",
    monthly: "Bulanan",
    alltime: "Sepanjang masa",
  };

  return (
    <div className="bg-paper-2 border border-rule rounded-none p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Fire weight="fill" className="text-accent text-lg" />
        <h3 className="font-display text-base text-ink">Anime populer</h3>
      </div>
      
      <div className="flex gap-1 border-b border-rule mb-4">
        {(["weekly", "monthly", "alltime"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-[1px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus ${
              tab === t ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-6 h-6 bg-paper-3 rounded-none" />
              <div className="w-12 h-16 bg-paper-3 rounded-none flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-paper-3 rounded-none w-3/4" />
                <div className="h-2 bg-paper-3 rounded-none w-1/2" />
              </div>
            </div>
          ))
        ) : (
          data?.[tab]?.map((anime: any, i: number) => (
            <Link
              href={`/anime/${anime.slug}`}
              key={anime.slug}
              className="group flex gap-3 items-center py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded-none"
            >
              <div className={`w-6 text-center font-display text-sm num ${i === 0 ? "text-accent font-bold" : i === 1 ? "text-ink font-semibold" : i === 2 ? "text-muted font-medium" : "text-muted/60"}`}>
                {anime.rank}
              </div>
              <img
                src={proxyImg(anime.thumbnail)}
                alt={anime.title}
                className="w-12 h-16 object-cover rounded-none bg-paper-3 border border-rule group-hover:opacity-85 transition-opacity"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-ink line-clamp-2 group-hover:text-accent transition-colors">
                  {anime.title}
                </h4>
                {anime.score && (
                  <div className="text-[11px] text-accent mt-1 num">★ {anime.score}</div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function TodayScheduleWidget() {
  const [todayData, setTodayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any>("/schedule").then((res) => {
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
      const today = days[new Date().getDay()];
      const dayData = res.data.find((d: any) => d.day === today);
      setTodayData(dayData?.animes.slice(0, 6) || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="bg-paper-2 border border-rule rounded-none p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock weight="fill" className="text-accent text-lg" />
        <h3 className="font-display text-base text-ink">Jadwal hari ini</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-14 bg-paper-3 rounded-none flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-paper-3 rounded-none w-full" />
                <div className="h-2 bg-paper-3 rounded-none w-1/3" />
              </div>
            </div>
          ))
        ) : todayData.length > 0 ? (
          todayData.map((anime: any) => (
            <Link
              href={`/anime/${anime.slug}`}
              key={anime.slug}
              className="group flex gap-3 items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded-none"
            >
              <img
                src={proxyImg(anime.thumbnail)}
                alt={anime.title}
                className="w-10 h-14 object-cover rounded-none bg-paper-3 border border-rule group-hover:opacity-85 transition-opacity"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-ink line-clamp-2 group-hover:text-accent transition-colors">
                  {anime.title}
                </h4>
                <div className="text-[11px] text-muted mt-1">{anime.episodeLabel || anime.type || "N/A"}</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-xs text-muted text-center py-4">Belum ada jadwal tayang hari ini</div>
        )}
      </div>
      <Link
        href="/schedule"
        className="block text-center text-xs font-medium text-accent hover:underline mt-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded-none"
      >
        Lihat jadwal rilis lengkap
      </Link>
    </div>
  );
}

function SeasonsWidget() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any>("/seasons").then((res) => {
      setSeasons(res.data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="bg-paper-2 border border-rule rounded-none p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarBlank weight="fill" className="text-accent text-lg" />
        <h3 className="font-display text-base text-ink">Arsip musim</h3>
      </div>
      
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto overscroll-contain pr-1">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-paper-3 rounded-none animate-pulse w-full" />
          ))
        ) : seasons.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {seasons.map((season: any) => (
              <Link 
                href={`/season/${season.slug}`} 
                key={season.slug} 
                className="group flex justify-between items-center gap-2 px-3 py-2 bg-paper rounded-none hover:bg-paper-3 transition-colors border border-rule focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
              >
                <span className="text-xs font-medium text-ink-2 group-hover:text-accent transition-colors line-clamp-1">{season.label}</span>
                {season.count > 0 && (
                  <span className="text-[10px] text-muted bg-paper-3 px-1.5 py-0.5 rounded-none num">{season.count}</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted text-center py-4">Data musim tidak ditemukan</div>
        )}
      </div>
    </div>
  );
}
