import type { Metadata } from "next";
import { AnimeDetailContent } from "./AnimeDetailContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Anime: ${slug} — AniBatch`,
    description: `Detail dan download anime ${slug} subtitle Indonesia di AniBatch`,
  };
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AnimeDetailContent slug={slug} />;
}
