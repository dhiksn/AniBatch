const { getAnimesBySeason } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/season/:slug
// e.g. GET /api/season/fall-2013
async function season(req, res) {
  const { slug } = req.params;

  // Validate: slug must be <word>-<4-digit-year>, e.g. "fall-2013", "summer-2026"
  if (!slug || !/^[a-z]+-\d{4}$/.test(slug)) {
    return sendError(res, 400, 'BAD_REQUEST',
      'Slug season tidak valid. Format yang benar: fall-2013, summer-2026, winter-2024, spring-2025');
  }

  try {
    const data = await getAnimesBySeason(slug);
    return sendSuccess(res, data.animes, 200, { season: data.season, slug });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message = process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server'
      : err.message;
    return sendError(res, statusCode, code, message);
  }
}

module.exports = { season };
