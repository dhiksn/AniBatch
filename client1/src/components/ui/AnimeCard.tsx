"use client";

import Link from "next/link";
import { Star } from "@phosphor-icons/react";
import { proxyImg } from "@/lib/image";

interface AnimeCardProps {
  anime: {
    title: string;
    slug: string;
    thumbnail?: string;
    score?: string;
    type?: string;
    episodeLabel?: string;
    status?: string;
  };
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.slug}`}>
      <div className="group relative flex flex-col gap-3">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-stone-900 border border-stone-800/50">
          <img
            src={proxyImg(anime.thumbnail)}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {anime.status && (
            <div className="absolute top-0 left-0 w-20 h-20 overflow-hidden z-10 pointer-events-none">
              <div className="absolute top-[17px] left-[-26px] w-[110px] -rotate-45 bg-red-600 text-white text-center text-[9px] font-bold uppercase tracking-wider py-[3px] shadow-md whitespace-nowrap">
                {anime.status}
              </div>
            </div>
          )}
    
          {anime.score && (
            <div className="absolute top-2 right-2 bg-stone-950/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-yellow-500 flex items-center gap-1 border border-stone-800/50">
              <Star weight="fill" size={10} /> {anime.score}
            </div>
          )}

          {anime.type && (
            <div className="absolute bottom-2 left-2 bg-brand-500 text-stone-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {anime.type}
            </div>
          )}

          {anime.episodeLabel && (
            <div className="absolute bottom-2 right-2 bg-stone-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-stone-200 border border-stone-800/50">
              {anime.episodeLabel}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stone-200 line-clamp-2 leading-snug group-hover:text-brand-500 transition-colors">
            {anime.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}