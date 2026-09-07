export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    success: true,
    author: 'dhiksn',
    service: 'AniBatch API',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
