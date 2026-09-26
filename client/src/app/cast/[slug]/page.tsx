import type { Metadata } from "next";
import { CastContent } from "./CastContent";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `Cast: ${params.slug} — AniBatch`,
    description: `Daftar anime dengan cast ${params.slug} di AniBatch`,
  };
}

export default function CastPage({ params }: { params: { slug: string } }) {
  return <CastContent slug={params.slug} />;
}
