import type { Metadata } from "next";
import { AnimeDetailContent } from "./AnimeDetailContent";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `Anime: ${params.slug} — AniBatch`,
    description: `Detail dan download anime ${params.slug} subtitle Indonesia di AniBatch`,
  };
}

export default function AnimeDetailPage({ params }: { params: { slug: string } }) {
  return <AnimeDetailContent slug={params.slug} />;
}
