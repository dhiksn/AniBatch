import type { Metadata } from "next";
import { SeasonContent } from "./SeasonContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const capitalizedSlug = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    title: `Musim: ${capitalizedSlug} — AniBatch`,
    description: `Daftar anime yang rilis pada musim ${capitalizedSlug} di AniBatch`,
  };
}

export default async function SeasonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SeasonContent slug={slug} />;
}
