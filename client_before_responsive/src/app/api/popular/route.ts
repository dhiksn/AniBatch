import { getPopular } from '@/lib/scraper/index.js';
import { successResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  try {
    const { animes, pagination } = await getPopular(page);
    return successResponse(animes, 200, {
      pagination: { page: pagination.page, hasPrev: pagination.hasPrev, hasNext: pagination.hasNext, totalPages: pagination.totalPages },
    });
  } catch (err) {
    return handleError(err);
  }
}
