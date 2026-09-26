import type { Metadata } from "next";
import { GenreDetailContent } from "./GenreDetailContent";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `Genre: ${params.slug} — AniBatch`,
    description: `Menampilkan anime dengan genre ${params.slug} di AniBatch`,
  };
}

export default function GenreDetailPage({ params }: { params: { slug: string } }) {
  return <GenreDetailContent slug={params.slug} />;
}
