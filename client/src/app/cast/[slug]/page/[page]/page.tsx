import type { Metadata } from "next";
import { CastContent } from "@/app/cast/[slug]/CastContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; page: string }> }): Promise<Metadata> {
  const { slug, page } = await params;
  const capitalizedSlug = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const pageTitle = page && page !== '1' 
    ? `Cast: ${capitalizedSlug} — Page ${page} — AniBatch`
    : `Cast: ${capitalizedSlug} — AniBatch`;
  
  return {
    title: pageTitle,
    description: `Daftar anime dengan cast ${capitalizedSlug} di AniBatch`,
  };
}

export default async function CastPage({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug } = await params;
  return <CastContent slug={slug} />;
}