const AUTHOR = 'dhiksn';

export function successResponse(data: unknown, statusCode = 200, extra: Record<string, unknown> = {}) {
  const { pagination, ...rest } = extra;
  return Response.json({
    success: true,
    author: AUTHOR,
    ...rest,
    data,
    ...(pagination !== undefined ? { pagination } : {}),
  }, { status: statusCode });
}

export function errorResponse(statusCode: number, code: string, message: string) {
  return Response.json(
    { success: false, author: AUTHOR, error: { code, message } },
    { status: statusCode }
  );
}

export function handleError(err: any) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = process.env.NODE_ENV === 'production'
    ? 'Terjadi kesalahan pada server'
    : err.message || 'Internal Server Error';
  return errorResponse(statusCode, code, message);
}
