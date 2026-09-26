import type { Metadata } from "next";
import { SeasonContent } from "./SeasonContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Musim: ${slug} — AniBatch`,
    description: `Daftar anime yang rilis pada musim ${slug} di AniBatch`,
  };
}

export default async function SeasonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SeasonContent slug={slug} />;
}
