import { getAnimeByGenre } from '@/lib/scraper/index.js';
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug || !/^[\w-]+$/.test(slug))
    return errorResponse(400, 'BAD_REQUEST', 'Slug genre tidak valid');
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  try {
    const { genre, animes, pagination } = await getAnimeByGenre(slug, page);
    return successResponse(animes, 200, {
      genre,
      pagination: { page: pagination.page, hasPrev: pagination.hasPrev, hasNext: pagination.hasNext, totalPages: pagination.totalPages },
    });
  } catch (err) {
    return handleError(err);
  }
}
