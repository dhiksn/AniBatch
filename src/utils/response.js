/**
 * Response helper — automatically injects author field into every response.
 */

const AUTHOR = 'dhiksn';

/**
 * Send a successful JSON response.
 *
 * Field order in output:
 *   success → author → [extra fields except pagination] → data → pagination
 *
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} [statusCode=200]
 * @param {object} [extra={}]  Extra root-level fields (e.g. query, pagination, genre)
 */
function sendSuccess(res, data, statusCode = 200, extra = {}) {
  const { pagination, ...rest } = extra;

  return res.status(statusCode).json({
    success: true,
    author: AUTHOR,
    ...rest,
    data,
    ...(pagination !== undefined ? { pagination } : {}),
  });
}

/**
 * Send an error JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} code   Machine-readable error code (e.g. "NOT_FOUND")
 * @param {string} message Human-readable message
 */
function sendError(res, statusCode, code, message) {
  return res.status(statusCode).json({
    success: false,
    author: AUTHOR,
    error: { code, message },
  });
}

module.exports = { sendSuccess, sendError, AUTHOR };
