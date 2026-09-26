import type { Metadata } from "next";
import { AnimeDetailContent } from "./AnimeDetailContent";
import { fetchApi } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const res = await fetchApi<any>(`/anime/${slug}`);
    const animeTitle = res.data?.title || slug;
    
    return {
      title: `${animeTitle} — AniBatch`,
      description: `Detail dan download ${animeTitle} subtitle Indonesia di AniBatch`,
    };
  } catch {
    const capitalizedSlug = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      title: `${capitalizedSlug} — AniBatch`,
      description: `Detail dan download anime ${capitalizedSlug} subtitle Indonesia di AniBatch`,
    };
  }
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AnimeDetailContent slug={slug} />;
}
