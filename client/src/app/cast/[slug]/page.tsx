import type { Metadata } from "next";
import { CastContent } from "./CastContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Cast: ${slug} — AniBatch`,
    description: `Daftar anime dengan cast ${slug} di AniBatch`,
  };
}

export default async function CastPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CastContent slug={slug} />;
}
