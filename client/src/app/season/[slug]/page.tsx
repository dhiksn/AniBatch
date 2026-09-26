import type { Metadata } from "next";
import { SeasonContent } from "./SeasonContent";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `Musim: ${params.slug} — AniBatch`,
    description: `Daftar anime yang rilis pada musim ${params.slug} di AniBatch`,
  };
}

export default function SeasonPage({ params }: { params: { slug: string } }) {
  return <SeasonContent slug={params.slug} />;
}
