/**
 * HTTP client using Node.js native https module.
 *
 * Supports Cloudflare challenge bypass via Boterdrop Solver.
 * When a CF challenge is detected, the client calls CF_SOLVER_URL
 * (/clearance endpoint) to obtain cf_clearance cookie, then retries.
 */

const https = require('https');
const http  = require('http');
const zlib  = require('zlib');
const dns   = require('dns');
require('dotenv').config();

// Bypass internet positif — pakai DNS publik Google & Cloudflare
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

const BASE_URL        = process.env.BASE_URL        || 'https://alqanime.net';
const CF_SOLVER_URL   = process.env.CF_SOLVER_URL   || null; // e.g. http://127.0.0.1:8001
const TIMEOUT_MS      = parseInt(process.env.HTTP_TIMEOUT, 10)       || 15000;
const MAX_REDIRECTS   = parseInt(process.env.HTTP_MAX_REDIRECTS, 10) || 5;
const REQUEST_RETRIES = 3;
const RETRY_DELAY_MS  = 2000;

const BASE_HOST = new URL(BASE_URL).hostname;

// Cloudflare clearance state — shared across requests
let cfClearance   = null; // cf_clearance cookie value
let cfUserAgent   = null; // UA that was used to solve
let cfSolving     = false;
let cfSolveQueue  = [];   // pending callbacks waiting for solve

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Call Boterdrop /clearance endpoint and wait for result.
 * Returns { cf_clearance, user_agent } or throws.
 */
async function solveCfChallenge() {
  if (!CF_SOLVER_URL) {
    const e = new Error('Cloudflare challenge detected but CF_SOLVER_URL is not configured.');
    e.statusCode = 503;
    e.code = 'CF_CHALLENGE';
    throw e;
  }

  // If already solving, queue up and wait
  if (cfSolving) {
    return new Promise((resolve, reject) => {
      cfSolveQueue.push({ resolve, reject });
    });
  }

  cfSolving = true;
  console.log('[CF Solver] Cloudflare challenge detected — requesting clearance...');

  try {
    const solverUrl = `${CF_SOLVER_URL}/clearance?url=${encodeURIComponent(BASE_URL)}&timeout=60`;
    const lib = solverUrl.startsWith('https') ? https : http;

    const result = await new Promise((resolve, reject) => {
      const req = lib.get(solverUrl, { timeout: 90000 }, (res) => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString());
            resolve(body);
          } catch (e) {
            reject(new Error('Invalid JSON from CF solver'));
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('CF solver timeout')); });
    });

    if (!result.cf_clearance) {
      throw new Error(`CF solver failed: ${JSON.stringify(result)}`);
    }

    cfClearance = result.cf_clearance;
    cfUserAgent = result.user_agent || cfUserAgent;
    console.log(`[CF Solver] Got cf_clearance: ${cfClearance.slice(0, 20)}...`);

    // Notify queued waiters
    cfSolveQueue.forEach(({ resolve }) => resolve({ cf_clearance: cfClearance, user_agent: cfUserAgent }));
    cfSolveQueue = [];

    return { cf_clearance: cfClearance, user_agent: cfUserAgent };
  } catch (err) {
    cfSolveQueue.forEach(({ reject }) => reject(err));
    cfSolveQueue = [];
    throw err;
  } finally {
    cfSolving = false;
  }
}

/**
 * Detect Cloudflare "Just a moment..." challenge page.
 */
function isCfChallenge(statusCode, html) {
  if (statusCode === 403 || statusCode === 503) return true;
  if (!html) return false;
  return (
    html.includes('Just a moment') ||
    html.includes('cf-browser-verification') ||
    html.includes('Performing security verification') ||
    html.includes('cf_clearance') ||
    html.includes('cdn-cgi/challenge-platform')
  );
}

/**
 * Build headers, optionally injecting cf_clearance cookie.
 */
function buildHeaders(withCookie = false) {
  const ua = cfUserAgent ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

  const headers = {
    'User-Agent': ua,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Upgrade-Insecure-Requests': '1',
  };

  if (withCookie && cfClearance) {
    headers['Cookie'] = `cf_clearance=${cfClearance}`;
  }

  return headers;
}

function _rawGet(path, redirectCount = 0, useCookie = false) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_HOST,
      port: 443,
      path,
      method: 'GET',
      rejectUnauthorized: false,
      timeout: TIMEOUT_MS,
      headers: buildHeaders(useCookie),
    };

    const req = https.request(options, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (redirectCount >= MAX_REDIRECTS) return reject(new Error('Too many redirects'));
        const location = res.headers.location;
        let nextPath;
        try {
          const u = new URL(location, BASE_URL);
          if (u.hostname !== BASE_HOST) {
            const e = new Error(`Cross-host redirect to ${u.hostname}`);
            e.statusCode = 503; e.code = 'SERVICE_UNAVAILABLE';
            return reject(e);
          }
          nextPath = u.pathname + u.search;
        } catch { nextPath = location; }
        res.resume();
        return resolve(_rawGet(nextPath, redirectCount + 1, useCookie));
      }

      if (res.statusCode === 404) {
        res.resume();
        const e = new Error('Halaman tidak ditemukan di website target');
        e.statusCode = 404; e.code = 'NOT_FOUND';
        return reject(e);
      }

      if (res.statusCode === 429) {
        res.resume();
        const e = new Error('Target website membatasi request. Coba lagi nanti.');
        e.statusCode = 429; e.code = 'TOO_MANY_REQUESTS';
        return reject(e);
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        let body = Buffer.concat(chunks);
        const enc = res.headers['content-encoding'];
        try {
          if (enc === 'gzip')         body = zlib.gunzipSync(body);
          else if (enc === 'deflate') body = zlib.inflateSync(body);
          else if (enc === 'br')      body = zlib.brotliDecompressSync(body);
        } catch (_) {}
        const html = body.toString('utf-8');

        // Internet positif detection
        if (
          res.headers['access-control-allow-origin']?.includes('internetbaik') ||
          html.includes('Internet Baik') ||
          html.includes('internet-positif') ||
          html.includes('internetpositif.net')
        ) {
          const e = new Error('Akses diblokir oleh ISP (Internet Positif).');
          e.statusCode = 503; e.code = 'SERVICE_UNAVAILABLE';
          return reject(e);
        }

        // Cloudflare challenge detection — resolve with special marker
        if (isCfChallenge(res.statusCode, html)) {
          const e = new Error('CF_CHALLENGE');
          e.statusCode = 503; e.code = 'CF_CHALLENGE';
          e.isCfChallenge = true;
          return reject(e);
        }

        resolve(html);
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const e = new Error('Request timed out');
      e.statusCode = 408; e.code = 'TIMEOUT';
      reject(e);
    });

    req.on('error', (err) => {
      const e = new Error(`Network error: ${err.message}`);
      e.statusCode = 503; e.code = err.code || 'SERVICE_UNAVAILABLE';
      reject(e);
    });

    req.end();
  });
}

/**
 * Fetch a page with automatic retry and CF challenge bypass.
 */
async function fetchPage(path) {
  const TRANSIENT = new Set(['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'TIMEOUT']);

  for (let attempt = 1; attempt <= REQUEST_RETRIES; attempt++) {
    try {
      // Use cf_clearance cookie if we already have one
      return await _rawGet(path, 0, !!cfClearance);
    } catch (err) {
      // Cloudflare challenge — solve and retry once
      if (err.isCfChallenge) {
        console.log(`[CF Solver] Challenge on attempt ${attempt}, solving...`);
        try {
          await solveCfChallenge();
          // Retry immediately with new cookie
          return await _rawGet(path, 0, true);
        } catch (solveErr) {
          if (!err.statusCode) { solveErr.statusCode = 503; solveErr.code = 'CF_CHALLENGE'; }
          throw solveErr;
        }
      }

      const isTransient = TRANSIENT.has(err.code);
      const isLast      = attempt === REQUEST_RETRIES;

      if (isLast || !isTransient) {
        if (!err.statusCode) { err.statusCode = 503; err.code = 'SERVICE_UNAVAILABLE'; }
        throw err;
      }

      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
}

module.exports = { fetchPage, BASE_URL };
