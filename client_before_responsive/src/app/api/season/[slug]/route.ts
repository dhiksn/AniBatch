import { getAnimesBySeason } from '@/lib/scraper/index.js';
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug || !/^[a-z]+-\d{4}$/.test(slug))
    return errorResponse(400, 'BAD_REQUEST', 'Slug season tidak valid. Format: fall-2013, summer-2026');
  try {
    const data = await getAnimesBySeason(slug) as any;
    return successResponse(data.animes, 200, { season: data.season, slug });
  } catch (err) {
    return handleError(err);
  }
}
