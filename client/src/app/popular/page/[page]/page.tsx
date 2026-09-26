import type { Metadata } from "next";
import { PopularContent } from "@/app/popular/PopularContent";

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  const pageTitle = page && page !== '1' 
    ? `Anime Populer — Page ${page}`
    : `Anime Populer`;
  
  return {
    title: pageTitle,
    description: "Daftar anime paling populer sepanjang masa di AniBatch",
  };
}

export default function PopularPage({ params }: { params: Promise<{ page: string }> }) {
  return <PopularContent />;
}