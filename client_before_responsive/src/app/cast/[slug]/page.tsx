import type { Metadata } from "next";
import { CastContent } from "./CastContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const capitalizedSlug = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    title: `Cast: ${capitalizedSlug} — AniBatch`,
    description: `Daftar anime dengan cast ${capitalizedSlug} di AniBatch`,
  };
}

export default async function CastPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CastContent slug={slug} />;
}
