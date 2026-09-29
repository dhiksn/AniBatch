import type { Metadata } from "next";
import { GenreDetailContent } from "./GenreDetailContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const capitalizedSlug = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    title: `Genre: ${capitalizedSlug} — AniBatch`,
    description: `Menampilkan anime dengan genre ${capitalizedSlug} di AniBatch`,
  };
}

export default async function GenreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GenreDetailContent slug={slug} />;
}
