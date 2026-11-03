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
    <Link
      href={`/anime/${anime.slug}`}
      className="group flex flex-col gap-2.5 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-0"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-none bg-paper-2 border border-rule transition-[outline] duration-200 group-hover:outline group-hover:outline-1 group-hover:outline-accent">
        <img
          src={proxyImg(anime.thumbnail)}
          alt={anime.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />

        {anime.status && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-block px-2 py-0.5 rounded-none bg-paper/80 border border-rule text-[11px] font-medium text-ink-2">
              {anime.status}
            </span>
          </div>
        )}

        {anime.score && (
          <div className="absolute top-2 right-2 bg-paper/80 px-2 py-0.5 rounded-none text-[11px] font-medium text-ink-2 flex items-center gap-1 border border-rule">
            <Star weight="fill" size={10} className="shrink-0 text-accent" />
            <span className="num">{anime.score}</span>
          </div>
        )}

        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1 z-10">
          {anime.type ? (
            <span className="px-2 py-0.5 rounded-none bg-paper/80 text-ink-2 text-[11px] font-medium border border-rule">
              {anime.type}
            </span>
          ) : <span />}

          {anime.episodeLabel && (
            <span className="px-2 py-0.5 rounded-none bg-paper/80 text-ink-2 text-[11px] font-medium border border-rule truncate max-w-[65%]">
              {anime.episodeLabel}
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="font-serif text-sm font-medium text-ink line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          {anime.title}
        </h3>
      </div>
    </Link>
  );
}
