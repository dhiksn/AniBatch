import { getAnimeDetail } from '@/lib/scraper/index.js';
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug || !/^[\w-]+$/.test(slug))
    return errorResponse(400, 'BAD_REQUEST', 'Slug tidak valid');
  try {
    return successResponse(await getAnimeDetail(slug));
  } catch (err) {
    return handleError(err);
  }
}
