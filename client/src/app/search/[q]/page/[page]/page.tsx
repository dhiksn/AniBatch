import type { Metadata } from "next";
import { SearchContent } from "@/app/search/SearchContent";

export async function generateMetadata({ params }: { params: Promise<{ q: string; page: string }> }): Promise<Metadata> {
  const { q, page } = await params;
  const pageTitle = page && page !== '1' 
    ? `Pencarian: ${q} — Page ${page} — AniBatch`
    : `Pencarian: ${q} — AniBatch`;
  
  return {
    title: pageTitle,
    description: `Hasil pencarian untuk ${q} di AniBatch`,
  };
}

export default async function SearchPage({ params }: { params: Promise<{ q: string; page: string }> }) {
  const { q } = await params;
  return <SearchContent query={q} />;
}