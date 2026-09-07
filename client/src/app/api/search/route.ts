import { searchAnime } from '@/lib/scraper/index.js';
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  if (!q || q.trim().length < 2)
    return errorResponse(400, 'BAD_REQUEST', 'Parameter "q" wajib diisi dan minimal 2 karakter');
  try {
    const { results, pagination } = await searchAnime(q.trim(), page);
    return successResponse(results, 200, {
      query: q.trim(),
      pagination: { page: pagination.page, hasPrev: pagination.hasPrev, hasNext: pagination.hasNext, totalPages: pagination.totalPages },
    });
  } catch (err) {
    return handleError(err);
  }
}
