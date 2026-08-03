const { getAnimeDetail } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

async function detail(req, res) {
  const { slug } = req.params;

  // Basic slug validation — only allow URL-safe characters
  if (!slug || !/^[\w-]+$/.test(slug)) {
    return sendError(res, 400, 'BAD_REQUEST', 'Slug tidak valid');
  }

  try {
    const data = await getAnimeDetail(slug);
    return sendSuccess(res, data);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Terjadi kesalahan pada server'
        : err.message;
    return sendError(res, statusCode, code, message);
  }
}

module.exports = { detail };
