/**
 * Scraper service — all actual HTTP + parse calls live here.
 *
 * Each exported function:
 *  1. Checks the cache first.
 *  2. Fetches HTML from alqanime.net if not cached.
 *  3. Parses the HTML.
 *  4. Stores the result in cache.
 *  5. Returns the parsed data.
 *
 * Cache TTLs (seconds):
 *  - home   : 300  (5 min)
 *  - search : 180  (3 min)
 *  - detail : 600  (10 min)
 *  - genre  : 1800 (30 min)
 */

const NodeCache = require('node-cache');
const { fetchPage } = require('../utils/http');
const {
  parseHomePage,
  parseAnimeDetail,
  parseSearchResults,
  parseGenres,
  parseAnimeCard,
  parsePagination,
  parseSeasonPage,
  parsePopularSidebar,
  parseSeasonList,
  resolveUrl,
  urlToSlug,
} = require('../utils/parser');

// Single shared cache instance
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const TTL = {
  home:   300,
  search: 180,
  detail: 600,
  genre:  1800,
};

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

async function getHome(page = 1) {
  const key = `home:${page}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  // Page 1 = homepage, page 2+ = /page/N/
  const path = page > 1 ? `/page/${page}/` : '/';
  const html = await fetchPage(path);

  let data;
  if (page === 1) {
    // Full homepage with all sections
    data = parseHomePage(html);
  } else {
    // Subsequent pages only have latest cards + pagination
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const latest = [];

    // Only grab cards from the "latest" section, not completed/movies
    let grabbed = false;
    $('#content .bixbox').each((_, el) => {
      const $box = $(el);
      const releasesClass = $box.find('.releases').first().attr('class') || '';
      if ($box.hasClass('latestdark') || releasesClass.includes('latesthome')) {
        $box.find('article.bs').each((__, card) => {
          latest.push(parseAnimeCard($, card));
        });
        grabbed = true;
      }
    });

    // Fallback: if selector didn't match, take all cards (old behaviour)
    if (!grabbed) {
      $('article.bs').each((_, el) => {
        latest.push(parseAnimeCard($, el));
      });
    }

    const pagination = parsePagination(html, page);
    data = { hot: [], latest: latest.map(({ score, ...card }) => card), completed: [], movies: [], popular: null, pagination };
  }

  // Add pagination to page 1 too
  if (page === 1) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    data.pagination = parsePagination(html, 1);
  }

  cache.set(key, data, TTL.home);
  return data;
}

// ---------------------------------------------------------------------------
// Anime detail
// ---------------------------------------------------------------------------

async function getAnimeDetail(slug) {
  if (!slug || typeof slug !== 'string') {
    const e = new Error('Slug tidak valid');
    e.statusCode = 400;
    e.code = 'BAD_REQUEST';
    throw e;
  }

  const key = `detail:${slug}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  // alqanime.net uses /<slug>/ at root — no /anime/ prefix
  const html = await fetchPage(`/${slug}/`);
  const data = parseAnimeDetail(html);

  // If the parser returned no title, the page is likely a 404-style soft error
  if (!data.title) {
    const e = new Error('Anime tidak ditemukan');
    e.statusCode = 404;
    e.code = 'NOT_FOUND';
    throw e;
  }

  cache.set(key, data, TTL.detail);
  return data;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

async function searchAnime(query, page = 1) {
  if (!query || query.trim().length < 2) {
    const e = new Error('Query pencarian minimal 2 karakter');
    e.statusCode = 400;
    e.code = 'BAD_REQUEST';
    throw e;
  }

  const q = query.trim();
  const key = `search:${q}:${page}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  // alqanime.net search URL pattern: /page/N/?s=<query>
  const encoded = encodeURIComponent(q);
  const path = page > 1
    ? `/page/${page}/?s=${encoded}`
    : `/?s=${encoded}`;

  const html = await fetchPage(path);
  const results = parseSearchResults(html);
  const pagination = parsePagination(html, page);

  const data = { results, pagination };
  cache.set(key, data, TTL.search);
  return data;
}

// ---------------------------------------------------------------------------
// Genres list
// ---------------------------------------------------------------------------

async function getGenres() {
  const key = 'genres';
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  // alqanime.net has a dedicated genre index at /genre/
  // which lists all genres as WordPress tag links: /tag/<slug>/
  const html = await fetchPage('/genre/');
  const genres = parseGenres(html);

  cache.set(key, genres, TTL.genre);
  return genres;
}

// ---------------------------------------------------------------------------
// Anime by genre
// ---------------------------------------------------------------------------

async function getAnimeByGenre(slug, page = 1) {
  if (!slug || typeof slug !== 'string') {
    const e = new Error('Slug genre tidak valid');
    e.statusCode = 400;
    e.code = 'BAD_REQUEST';
    throw e;
  }

  const key = `genre:${slug}:${page}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  // alqanime.net genres = WordPress tags at /tag/<slug>/
  // Pagination: /tag/<slug>/page/<n>/
  const path = page > 1
    ? `/tag/${slug}/page/${page}/`
    : `/tag/${slug}/`;

  const html = await fetchPage(path);

  const cheerio = require('cheerio');
  const $ = cheerio.load(html);

  // Genre name from page heading or title
  const genreName =
    $('h1.page-title, h1.entry-title, .wrapheader h2, .taxname').first().text().trim() ||
    $('title').text().replace(/[-|–].*$/, '').trim() ||
    slug;

  const animes = [];
  $('article.bs').each((_, el) => {
    animes.push(parseAnimeCard($, el));
  });

  const pagination = parsePagination(html, page);

  const data = {
    genre: { name: genreName, slug },
    animes,
    pagination,
  };

  cache.set(key, data, TTL.genre);
  return data;
}

// ---------------------------------------------------------------------------
// Popular
// ---------------------------------------------------------------------------

async function getPopular(page = 1) {
  const key = `popular:${page}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const path = page > 1
    ? `/popular/page/${page}/`
    : `/popular/`;

  const html = await fetchPage(path);

  const cheerio = require('cheerio');
  const $ = cheerio.load(html);

  const animes = [];
  $('article.bs').each((_, el) => {
    animes.push(parseAnimeCard($, el));
  });

  const pagination = parsePagination(html, page);

  const data = { animes, pagination };
  cache.set(key, data, TTL.home); // same TTL as home (5 min)
  return data;
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

async function getSchedule() {
  const key = 'schedule';
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const html = await fetchPage('/jadwal-rilis/');

  const cheerio = require('cheerio');
  const $ = cheerio.load(html);

  const days = [];

  // Each day = .bixbox with h3 as day name (skip first bixbox = disclaimer)
  $('#content .bixbox').each((_, el) => {
    const $box = $(el);
    const dayName = $box.find('.releases h3').first().text().trim();
    if (!dayName) return; // skip header/disclaimer box

    const animes = [];
    $box.find('article.bs').each((__, card) => {
      animes.push(parseAnimeCard($, card));
    });

    days.push({ day: dayName, animes });
  });

  cache.set(key, days, TTL.home); // 5 min TTL
  return days;
}

// ---------------------------------------------------------------------------
// Anime list (daftar-anime)
// ---------------------------------------------------------------------------

async function getAnimeList(letter = null) {
  const key = `list:${letter || 'all'}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const html = await fetchPage('/daftar-anime/');

  const cheerio = require('cheerio');
  const $ = cheerio.load(html);

  // Structure: .soralist > .blix (one per letter group)
  //   .blix > span > a[name="A"]  — letter anchor
  //   .blix > ul > li > a.series  — anime link
  const groups = [];

  $('.soralist .blix').each((_, blixEl) => {
    const $blix = $(blixEl);

    // Letter label from anchor name attribute
    const letterLabel = $blix.find('span a[name]').first().attr('name') || '';
    // Normalise: skip nav-only anchors that have no list items
    const items = [];

    $blix.find('ul li a.series').each((__, aEl) => {
      const title = $(aEl).text().trim();
      const href  = resolveUrl($(aEl).attr('href') || '');
      const slug  = urlToSlug(href);
      if (title && slug) items.push({ title, slug, url: href });
    });

    if (items.length === 0) return;

    // Filter by letter if requested
    const groupLetter = letterLabel.toUpperCase();
    if (letter && groupLetter !== letter.toUpperCase()) return;

    groups.push({ letter: groupLetter || '#', animes: items });
  });

  // Only cache "all" for longer; letter-filtered results are cheap to derive
  if (!letter) {
    cache.set(key, groups, TTL.genre); // 30 min — list rarely changes
  } else {
    cache.set(key, groups, TTL.genre);
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Advanced search
// ---------------------------------------------------------------------------

async function advancedSearch({ title, genres, seasons, studios, types, status, order, page }) {
  // Build query string matching the form's GET params exactly
  const params = new URLSearchParams();

  if (title)  params.set('title', title);
  if (status) params.set('status', status);
  if (order)  params.set('order', order);

  // Multi-value params use the name[] convention
  for (const g of genres)  params.append('genre[]', g);
  for (const s of seasons) params.append('season[]', s);
  for (const st of studios) params.append('studio[]', st);
  for (const t of types)   params.append('type[]', t);

  const cacheKey = `advsearch:${params.toString()}:p${page}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  // Pagination via path segment (/page/N/), not query param
  const pageSegment = page > 1 ? `page/${page}/` : '';
  const path = `/advanced-search/${pageSegment}?${params.toString()}`;
  const html = await fetchPage(path);

  const cheerio = require('cheerio');
  const $ = cheerio.load(html);

  const results = [];
  $('article.bs').each((_, el) => {
    results.push(parseAnimeCard($, el));
  });

  const pagination = parsePagination(html, page);
  const data = { results, pagination };

  cache.set(cacheKey, data, TTL.search); // 3 min TTL
  return data;
}

// ---------------------------------------------------------------------------
// Anime by season
// ---------------------------------------------------------------------------

async function getAnimesBySeason(slug) {
  const key = `season:${slug}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const html = await fetchPage(`/season/${slug}/`);
  const data = parseSeasonPage(html);

  if (!data.season) {
    const e = new Error('Season tidak ditemukan');
    e.statusCode = 404;
    e.code = 'NOT_FOUND';
    throw e;
  }

  cache.set(key, data, TTL.genre); // 30 min — season data rarely changes
  return data;
}

// ---------------------------------------------------------------------------
// Anime by cast
// ---------------------------------------------------------------------------

async function getAnimeByCast(slug, page = 1) {
  const key = `cast:${slug}:${page}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const path = page > 1
    ? `/cast/${slug}/page/${page}/`
    : `/cast/${slug}/`;

  const html = await fetchPage(path);

  const cheerio = require('cheerio');
  const $ = cheerio.load(html);

  // Cast name from page heading
  const name =
    $('.releases h1 span, .releases h1').first().text().trim() ||
    $('title').text().replace(/Archives.*$/i, '').trim();

  const animes = [];
  $('article.bs').each((_, el) => {
    animes.push(parseAnimeCard($, el));
  });

  const pagination = parsePagination(html, page);

  const data = { name, animes, pagination };
  cache.set(key, data, TTL.search); // 3 min
  return data;
}

// ---------------------------------------------------------------------------
// Popular sidebar (weekly / monthly / alltime top-5)
// ---------------------------------------------------------------------------

async function getPopularSidebar() {
  const key = 'popular-sidebar';
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  // Sidebar widget is present on homepage HTML
  const html = await fetchPage('/');
  const data = parsePopularSidebar(html);

  cache.set(key, data, TTL.home); // 5 min
  return data;
}

// ---------------------------------------------------------------------------
// Season list (from homepage sidebar)
// ---------------------------------------------------------------------------

async function getSeasonList() {
  const key = 'season-list';
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const html = await fetchPage('/');
  const data = parseSeasonList(html);

  cache.set(key, data, TTL.genre); // 30 min
  return data;
}

module.exports = {
  getHome,
  getAnimeDetail,
  searchAnime,
  getGenres,
  getAnimeByGenre,
  getPopular,
  getSchedule,
  getAnimeList,
  advancedSearch,
  getAnimesBySeason,
  getAnimeByCast,
  getPopularSidebar,
  getSeasonList,
};
