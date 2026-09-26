import type { Metadata } from "next";
import { GenreDetailContent } from "./GenreDetailContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Genre: ${slug} — AniBatch`,
    description: `Menampilkan anime dengan genre ${slug} di AniBatch`,
  };
}

export default async function GenreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GenreDetailContent slug={slug} />;
}
