import { advancedSearch } from '@/lib/scraper/index.js';
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const VALID_STATUS = new Set(['', 'ongoing', 'upcoming', 'completed']);
const VALID_ORDER  = new Set(['', 'title', 'titlereverse', 'update', 'added', 'popular', 'rating']);
const VALID_TYPE   = new Set(['bd', 'tv', 'movie', 'ova', 'ona', 'special', 'series', 'donghua', 'live-action']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title  = searchParams.get('title') || '';
  const status = searchParams.get('status') || '';
  const order  = searchParams.get('order') || '';
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const genres  = searchParams.getAll('genre[]').length  ? searchParams.getAll('genre[]')  : searchParams.getAll('genre');
  const seasons = searchParams.getAll('season[]').length ? searchParams.getAll('season[]') : searchParams.getAll('season');
  const studios = searchParams.getAll('studio[]').length ? searchParams.getAll('studio[]') : searchParams.getAll('studio');
  const types   = searchParams.getAll('type[]').length   ? searchParams.getAll('type[]')   : searchParams.getAll('type');

  if (status && !VALID_STATUS.has(status))
    return errorResponse(400, 'BAD_REQUEST', 'Parameter "status" tidak valid. Nilai yang diizinkan: ongoing, upcoming, completed');
  if (order && !VALID_ORDER.has(order))
    return errorResponse(400, 'BAD_REQUEST', 'Parameter "order" tidak valid');
  for (const t of types)
    if (!VALID_TYPE.has(t.toLowerCase()))
      return errorResponse(400, 'BAD_REQUEST', `Nilai type "${t}" tidak valid`);

  try {
    const { results, pagination } = await advancedSearch({
      title, genres, seasons, studios,
      types: types.map(t => t.toLowerCase()),
      status, order, page,
    });
    return successResponse(results, 200, {
      filters: { title, genres, seasons, studios, types, status, order },
      pagination: { page: pagination.page, hasPrev: pagination.hasPrev, hasNext: pagination.hasNext, totalPages: pagination.totalPages },
    });
  } catch (err) {
    return handleError(err);
  }
}
