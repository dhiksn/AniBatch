const AUTHOR = 'dhiksn';

function jsonResponse(body: unknown, statusCode = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function successResponse(data: unknown, statusCode = 200, extra: Record<string, unknown> = {}) {
  const { pagination, ...rest } = extra;
  return jsonResponse({
    success: true,
    author: AUTHOR,
    ...rest,
    data,
    ...(pagination !== undefined ? { pagination } : {}),
  }, statusCode);
}

export function errorResponse(statusCode: number, code: string, message: string) {
  return jsonResponse(
    { success: false, author: AUTHOR, error: { code, message } },
    statusCode
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
