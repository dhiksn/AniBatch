import { getHome } from '@/lib/scraper/index.js';
import { successResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  try {
    const data = await getHome(page);
    const { pagination, ...rest } = data as any;
    return successResponse(rest, 200, { pagination: pagination ?? null });
  } catch (err) {
    return handleError(err);
  }
}
