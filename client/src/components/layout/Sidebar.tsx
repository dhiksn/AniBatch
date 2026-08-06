"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { proxyImg } from "@/lib/image";
import { Fire, CalendarBlank, Clock } from "@phosphor-icons/react";

export function Sidebar({ showSchedule = true }: { showSchedule?: boolean }) {
  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6 hidden lg:flex">
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

  return (
    <div className="bg-stone-900/40 border border-stone-800/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Fire weight="fill" className="text-brand-500 text-lg" />
        <h3 className="text-sm font-bold text-stone-100 tracking-wide uppercase">Popular</h3>
      </div>
      
      <div className="flex gap-1 border-b border-stone-800/60 mb-4">
        {(["weekly", "monthly", "alltime"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-[1px] ${
              tab === t ? "border-brand-500 text-brand-500" : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-6 h-6 bg-stone-800 rounded" />
              <div className="w-12 h-16 bg-stone-800 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-stone-800 rounded w-3/4" />
                <div className="h-2 bg-stone-800 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          data?.[tab]?.map((anime: any, i: number) => (
            <Link href={`/anime/${anime.slug}`} key={anime.slug} className="group flex gap-3 items-center">
              <div className={`w-6 text-center font-black text-sm ${i === 0 ? "text-yellow-500" : i === 1 ? "text-stone-300" : i === 2 ? "text-amber-600" : "text-stone-700"}`}>
                {anime.rank}
              </div>
              <img src={proxyImg(anime.thumbnail)} alt={anime.title} className="w-12 h-16 object-cover rounded-md bg-stone-800 group-hover:opacity-80 transition-opacity" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-stone-200 line-clamp-2 group-hover:text-brand-500 transition-colors">
                  {anime.title}
                </h4>
                {anime.score && (
                  <div className="text-[10px] text-yellow-500 mt-1">★ {anime.score}</div>
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
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jum\'at','Sabtu'];
      const today = days[new Date().getDay()];
      const dayData = res.data.find((d: any) => d.day === today);
      setTodayData(dayData?.animes.slice(0, 6) || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="bg-stone-900/40 border border-stone-800/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock weight="fill" className="text-brand-500 text-lg" />
        <h3 className="text-sm font-bold text-stone-100 tracking-wide uppercase">Today's Schedule</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-14 bg-stone-800 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-stone-800 rounded w-full" />
                <div className="h-2 bg-stone-800 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : todayData.length > 0 ? (
          todayData.map((anime: any) => (
            <Link href={`/anime/${anime.slug}`} key={anime.slug} className="group flex gap-3 items-center">
              <img src={proxyImg(anime.thumbnail)} alt={anime.title} className="w-10 h-14 object-cover rounded-md bg-stone-800 group-hover:opacity-80 transition-opacity" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-stone-200 line-clamp-2 group-hover:text-brand-500 transition-colors">
                  {anime.title}
                </h4>
                <div className="text-[10px] text-stone-500 mt-1">{anime.episodeLabel || anime.type || 'N/A'}</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-xs text-stone-500 text-center py-4">No schedule today</div>
        )}
      </div>
      <Link href="/schedule" className="block text-center text-xs text-brand-500 hover:text-brand-400 mt-4 transition-colors">
        View full schedule &rarr;
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
    <div className="bg-stone-900/40 border border-stone-800/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarBlank weight="fill" className="text-brand-500 text-lg" />
        <h3 className="text-sm font-bold text-stone-100 tracking-wide uppercase">Seasons</h3>
      </div>
      
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-stone-800 rounded animate-pulse w-full" />
          ))
        ) : seasons.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {seasons.map((season: any) => (
              <Link 
                href={`/season/${season.slug}`} 
                key={season.slug} 
                className="group flex justify-between items-center px-3 py-2 bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors border border-stone-800"
              >
                <span className="text-xs font-medium text-stone-300 group-hover:text-brand-500 transition-colors line-clamp-1">{season.label}</span>
                {season.count > 0 && (
                  <span className="text-[10px] text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded">{season.count}</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-xs text-stone-500 text-center py-4">No seasons found</div>
        )}
      </div>
    </div>
  );
}
