const { getAnimeList } = require('../services/scraper');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/list
// GET /api/list?letter=A
// GET /api/list?letter=0-9   (numeric titles)
// GET /api/list?letter=%23   (# — symbol/special titles)
async function list(req, res) {
  const { letter } = req.query;

  if (letter !== undefined) {
    // Accept: single letter A-Z, '#', or the string '0-9'
    if (typeof letter !== 'string' || !/^([a-zA-Z#]|0-9)$/.test(letter)) {
      return sendError(
        res,
        400,
        'BAD_REQUEST',
        'Parameter "letter" harus berupa satu huruf (A-Z), "0-9", atau "#"'
      );
    }
  }

  try {
    const data = await getAnimeList(letter || null);
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

module.exports = { list };
