import type { Metadata } from "next";
import { GenreDetailContent } from "@/app/genre/[slug]/GenreDetailContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; page: string }> }): Promise<Metadata> {
  const { slug, page } = await params;
  const capitalizedSlug = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const pageTitle = page && page !== '1' 
    ? `Genre: ${capitalizedSlug} — Page ${page}`
    : `Genre: ${capitalizedSlug}`;
  
  return {
    title: pageTitle,
    description: `Menampilkan anime dengan genre ${capitalizedSlug} di AniBatch`,
  };
}

export default async function GenreDetailPage({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug } = await params;
  return <GenreDetailContent slug={slug} />;
}